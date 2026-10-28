<?php
// Métricas de GitHub en vivo para la sección de GitHub (assets/js/echo.js). Devuelve lo mismo que
// assets/data/github.json, que queda como respaldo si esto falla.
// Sin token lee el gráfico público del perfil. Con un token (variable de entorno GITHUB_TOKEN, o
// api/github-token.php con `<?php return 'github_pat_...';`, que no se sube al repo) usa la API
// oficial y suma commits y repos con commits. La respuesta se guarda en caché unas horas.
declare(strict_types=1);

const GH_USER = 'MateoRo2003';
const GH_TTL = 3 * 3600;
const GH_LEVEL = ['NONE' => 0, 'FIRST_QUARTILE' => 1, 'SECOND_QUARTILE' => 2, 'THIRD_QUARTILE' => 3, 'FOURTH_QUARTILE' => 4];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=900');

$cache = sys_get_temp_dir() . '/snapfolio-github-' . GH_USER . '.json';
if (is_file($cache) && time() - filemtime($cache) < GH_TTL) {
    readfile($cache);
    exit;
}

function gh_get(string $url, array $headers = [], ?string $body = null): ?string
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => array_merge(['User-Agent: Mozilla/5.0 (snapfolio)'], $headers),
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $out = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return ($out !== false && $code >= 200 && $code < 300) ? $out : null;
}

function gh_from_api(string $token): ?array
{
    $query = 'query($login: String!) { user(login: $login) { createdAt
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) { totalCount }
        contributionsCollection { totalCommitContributions totalRepositoriesWithContributedCommits
          contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }';
    $raw = gh_get('https://api.github.com/graphql', ["Authorization: bearer $token", 'Content-Type: application/json'],
        json_encode(['query' => $query, 'variables' => ['login' => GH_USER]]));
    $u = $raw ? (json_decode($raw, true)['data']['user'] ?? null) : null;
    if (!$u) return null;
    $cc = $u['contributionsCollection'];
    $days = [];
    foreach ($cc['contributionCalendar']['weeks'] as $w) {
        foreach ($w['contributionDays'] as $d) {
            $days[] = [$d['date'], $d['contributionCount'], GH_LEVEL[$d['contributionLevel']] ?? 0];
        }
    }
    return [
        'source' => 'api',
        'total' => $cc['contributionCalendar']['totalContributions'],
        'days' => $days,
        'stats' => [
            'commits' => $cc['totalCommitContributions'],
            'contributedRepos' => $cc['totalRepositoriesWithContributedCommits'],
            'publicRepos' => $u['repositories']['totalCount'],
            'since' => substr($u['createdAt'], 0, 10),
        ],
    ];
}

// sin token: cada celda del gráfico tiene fecha y nivel; la cantidad está en su tooltip
function gh_from_profile(): ?array
{
    $html = gh_get('https://github.com/users/' . GH_USER . '/contributions');
    if (!$html) return null;
    $counts = [];
    preg_match_all('/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/', $html, $tips, PREG_SET_ORDER);
    foreach ($tips as [, $id, $text]) {
        $counts[$id] = preg_match('/^(\d[\d,]*)\s+contribution/', $text, $n) ? (int) str_replace(',', '', $n[1]) : 0;
    }
    preg_match_all('/<td[^>]*data-date="[^"]+"[^>]*>/', $html, $cells);
    $days = [];
    foreach ($cells[0] as $cell) {
        preg_match('/data-date="([^"]+)"/', $cell, $date);
        $id = preg_match('/id="([^"]+)"/', $cell, $m) ? $m[1] : '';
        $level = preg_match('/data-level="(\d)"/', $cell, $l) ? (int) $l[1] : 0;
        $days[] = [$date[1], $counts[$id] ?? 0, $level];
    }
    if (!$days) return null;
    usort($days, fn($a, $b) => strcmp($a[0], $b[0]));
    $stats = [];
    $profile = gh_get('https://api.github.com/users/' . GH_USER, ['Accept: application/vnd.github+json']);
    if ($profile && ($p = json_decode($profile, true))) {
        $stats = ['publicRepos' => $p['public_repos'] ?? null, 'since' => substr($p['created_at'] ?? '', 0, 10)];
    }
    return ['source' => 'profile', 'total' => array_sum(array_column($days, 1)), 'days' => $days, 'stats' => $stats];
}

$token = getenv('GITHUB_TOKEN') ?: '';
if (!$token && is_file(__DIR__ . '/github-token.php')) {
    $token = (string) (include __DIR__ . '/github-token.php');
}
$data = ($token ? gh_from_api($token) : null) ?? gh_from_profile();

if (!$data) {
    // GitHub no respondió: mejor la última copia, aunque sea vieja, que nada
    if (is_file($cache)) {
        readfile($cache);
        exit;
    }
    http_response_code(503);
    echo json_encode(['error' => 'GitHub no respondió']);
    exit;
}

$json = json_encode(['user' => GH_USER, 'updated' => gmdate('Y-m-d')] + $data);
@file_put_contents($cache, $json, LOCK_EX);
echo $json;

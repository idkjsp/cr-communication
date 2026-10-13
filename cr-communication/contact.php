<?php
declare(strict_types=1);

const DEST = 'crcommunication@icloud.com';
const VERSIONS = ['V2', 'V5', 'V6', 'V7', 'V8'];

function clean(string $value, int $max): string
{
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

$version = (string) ($_POST['version'] ?? 'V2');
if (!in_array($version, VERSIONS, true)) {
    $version = 'V2';
}
$back = $version . '/contact.html';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ' . $back);
    exit;
}

if (trim((string) ($_POST['website'] ?? '')) !== '') {
    header('Location: ' . $back . '?ok=1');
    exit;
}

$name = clean((string) ($_POST['name'] ?? ''), 80);
$email = str_replace(' ', '', clean((string) ($_POST['email'] ?? ''), 120));
$message = (string) ($_POST['message'] ?? '');
$message = preg_replace('/[\x00-\x08\x0B-\x1F\x7F]+/', '', $message) ?? '';
$message = trim($message);
$message = function_exists('mb_substr') ? mb_substr($message, 0, 1500) : substr($message, 0, 1500);

if ($name === '' || $message === '') {
    header('Location: ' . $back . '?err=nom');
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ' . $back . '?err=email');
    exit;
}

$body = "Nom : {$name}\nE-mail pour la réponse : {$email}\n\n{$message}\n";
$subject = '=?UTF-8?B?' . base64_encode('Contact — ' . $name) . '?=';
$headers = "From: CR Communication <" . DEST . ">\r\n"
    . "Reply-To: {$email}\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";
$sent = @mail(DEST, $subject, $body, $headers);
header('Location: ' . $back . ($sent ? '?ok=1' : '?err=mail'));
exit;

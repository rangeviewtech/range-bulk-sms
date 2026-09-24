'use client';

import * as React from 'react';
import { Copy, Check, Terminal, Code2, Globe } from 'lucide-react';

export type SupportedLanguage =
  | 'curl'
  | 'javascript'
  | 'typescript'
  | 'nodejs'
  | 'python'
  | 'php'
  | 'go'
  | 'csharp'
  | 'java'
  | 'ruby'
  | 'kotlin'
  | 'swift'
  | 'dart'
  | 'rust'
  | 'powershell';

interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  extension: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'curl', name: 'cURL', extension: 'sh' },
  { id: 'javascript', name: 'JavaScript (Fetch)', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'nodejs', name: 'Node.js (Axios)', extension: 'js' },
  { id: 'python', name: 'Python (requests)', extension: 'py' },
  { id: 'php', name: 'PHP (cURL)', extension: 'php' },
  { id: 'go', name: 'Go (net/http)', extension: 'go' },
  { id: 'csharp', name: 'C# (.NET)', extension: 'cs' },
  { id: 'java', name: 'Java (HttpClient)', extension: 'java' },
  { id: 'ruby', name: 'Ruby (Net::HTTP)', extension: 'rb' },
  { id: 'kotlin', name: 'Kotlin (OkHttp)', extension: 'kt' },
  { id: 'swift', name: 'Swift (URLSession)', extension: 'swift' },
  { id: 'dart', name: 'Dart / Flutter', extension: 'dart' },
  { id: 'rust', name: 'Rust (reqwest)', extension: 'rs' },
  { id: 'powershell', name: 'PowerShell', extension: 'ps1' },
];

export function CodeSnippetViewer({
  environment = 'sandbox',
}: {
  environment?: 'sandbox' | 'production';
}) {
  const [selectedLang, setSelectedLang] = React.useState<SupportedLanguage>('curl');
  const [copied, setCopied] = React.useState(false);

  const baseUrl =
    environment === 'sandbox' ? 'http://localhost:3000/api/v1' : 'https://api.rangesms.com/v1';

  const generateSnippet = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'curl':
        return `curl --request POST \\
  --url ${baseUrl}/sms/send \\
  --header 'Authorization: Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx' \\
  --header 'Content-Type: application/json' \\
  --header 'Idempotency-Key: ${crypto.randomUUID()}' \\
  --data '{
    "to": "+999000000001",
    "senderId": "RANGE",
    "message": "Your verification code is 492018."
  }'`;

      case 'javascript':
        return `const response = await fetch("${baseUrl}/sms/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx",
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID()
  },
  body: JSON.stringify({
    to: "+999000000001",
    senderId: "RANGE",
    message: "Your verification code is 492018."
  })
});

const data = await response.json();
console.log("SMS Status:", data);`;

      case 'typescript':
        return `interface SendSmsRequest {
  to: string;
  senderId?: string;
  message: string;
  idempotencyKey?: string;
}

interface SendSmsResponse {
  success: boolean;
  messageId: string;
  status: string;
  cost?: number;
}

const payload: SendSmsRequest = {
  to: "+999000000001",
  senderId: "RANGE",
  message: "Your verification code is 492018."
};

const response = await fetch("${baseUrl}/sms/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx",
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID()
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  throw new Error(\`Request failed with status \${response.status}\`);
}

const result: SendSmsResponse = await response.json();
console.log("Created message ID:", result.messageId);`;

      case 'nodejs':
        return `const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function sendSms() {
  try {
    const response = await axios.post(
      "${baseUrl}/sms/send",
      {
        to: "+999000000001",
        senderId: "RANGE",
        message: "Your verification code is 492018."
      },
      {
        headers: {
          Authorization: "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx",
          "Content-Type": "application/json",
          "Idempotency-Key": uuidv4()
        },
        timeout: 10000
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.error("SMS dispatch error:", error.response?.data || error.message);
  }
}

sendSms();`;

      case 'python':
        return `import uuid
import requests

url = "${baseUrl}/sms/send"
headers = {
    "Authorization": "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx",
    "Content-Type": "application/json",
    "Idempotency-Key": str(uuid.uuid4())
}
payload = {
    "to": "+999000000001",
    "senderId": "RANGE",
    "message": "Your verification code is 492018."
}

response = requests.post(url, headers=headers, json=payload, timeout=10)

if response.ok:
    print("Success:", response.json())
else:
    print(f"Error {response.status_code}:", response.json())`;

      case 'php':
        return `<?php

$curl = curl_init();

$payload = json_encode([
    'to' => '+999000000001',
    'senderId' => 'RANGE',
    'message' => 'Your verification code is 492018.'
]);

curl_setopt_array($curl, [
    CURLOPT_URL => '${baseUrl}/sms/send',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx',
        'Content-Type: application/json',
        'Idempotency-Key: ' . bin2hex(random_bytes(16))
    ],
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($curl);

if ($response === false) {
    die('cURL error: ' . curl_error($curl));
}

curl_close($curl);
echo $response;`;

      case 'go':
        return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type SmsPayload struct {
	To       string \`json:"to"\`
	SenderID string \`json:"senderId"\`
	Message  string \`json:"message"\`
}

func main() {
	payload := SmsPayload{
		To:       "+999000000001",
		SenderID: "RANGE",
		Message:  "Your verification code is 492018.",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}

	req, err := http.NewRequest("POST", "${baseUrl}/sms/send", bytes.NewBuffer(body))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Authorization", "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Idempotency-Key", fmt.Sprintf("req-%d", time.Now().UnixNano()))

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	respBody, _ := io.ReadAll(res.Body)
	fmt.Printf("Status: %d\\nResponse: %s\\n", res.StatusCode, string(respBody))
}`;

      case 'csharp':
        return `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        client.DefaultRequestHeaders.Add("Authorization", "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx");
        client.DefaultRequestHeaders.Add("Idempotency-Key", Guid.NewGuid().ToString());

        var payload = new
        {
            to = "+999000000001",
            senderId = "RANGE",
            message = "Your verification code is 492018."
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await client.PostAsync("${baseUrl}/sms/send", content);

        var responseBody = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Status: {response.StatusCode}");
        Console.WriteLine($"Response: {responseBody}");
    }
}`;

      case 'java':
        return `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

public class RangeSmsClient {
    public static void main(String[] args) throws Exception {
        String json = """
            {
                "to": "+999000000001",
                "senderId": "RANGE",
                "message": "Your verification code is 492018."
            }
            """;

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("${baseUrl}/sms/send"))
                .header("Authorization", "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx")
                .header("Content-Type", "application/json")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + response.statusCode());
        System.out.println("Response: " + response.body());
    }
}`;

      case 'ruby':
        return `require 'net/http'
require 'uri'
require 'json'
require 'securerandom'

uri = URI.parse("${baseUrl}/sms/send")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request["Authorization"] = "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx"
request["Content-Type"] = "application/json"
request["Idempotency-Key"] = SecureRandom.uuid

request.body = {
  to: "+999000000001",
  senderId: "RANGE",
  message: "Your verification code is 492018."
}.to_json

response = http.request(request)
puts "Status: #{response.code}"
puts "Response: #{response.body}"`;

      case 'kotlin':
        return `import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.UUID

fun main() {
    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()

    val jsonPayload = """
        {
            "to": "+999000000001",
            "senderId": "RANGE",
            "message": "Your verification code is 492018."
        }
    """.trimIndent()

    val request = Request.Builder()
        .url("${baseUrl}/sms/send")
        .post(jsonPayload.toRequestBody(mediaType))
        .addHeader("Authorization", "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx")
        .addHeader("Idempotency-Key", UUID.randomUUID().toString())
        .build()

    client.newCall(request).execute().use { response ->
        println("Status: \${response.code}")
        println("Body: \${response.body?.string()}")
    }
}`;

      case 'swift':
        return `import Foundation

let url = URL(string: "${baseUrl}/sms/send")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue(UUID().uuidString, forHTTPHeaderField: "Idempotency-Key")

let payload: [String: Any] = [
    "to": "+999000000001",
    "senderId": "RANGE",
    "message": "Your verification code is 492018."
]

request.httpBody = try? JSONSerialization.data(withJSONObject: payload)

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data, let str = String(data: data, encoding: .utf8) {
        print("Response: \\(str)")
    }
}
task.resume()`;

      case 'dart':
        return `import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('${baseUrl}/sms/send');
  final response = await http.post(
    url,
    headers: {
      'Authorization': 'Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx',
      'Content-Type': 'application/json',
      'Idempotency-Key': 'flutter-run-\${DateTime.now().millisecondsSinceEpoch}',
    },
    body: jsonEncode({
      'to': '+999000000001',
      'senderId': 'RANGE',
      'message': 'Your verification code is 492018.',
    }),
  );

  print('Status: \${response.statusCode}');
  print('Response: \${response.body}');
}`;

      case 'rust':
        return `use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_static("Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx"));
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert("Idempotency-Key", HeaderValue::from_static("rust-req-001"));

    let payload = json!({
        "to": "+999000000001",
        "senderId": "RANGE",
        "message": "Your verification code is 492018."
    });

    let res = client
        .post("${baseUrl}/sms/send")
        .headers(headers)
        .json(&payload)
        .send()
        .await?;

    println!("Status: {}", res.status());
    println!("Body: {}", res.text().await?);
    Ok(())
}`;

      case 'powershell':
        return `$headers = @{
    "Authorization"   = "Bearer rsms_test_xxxxxxxxxxxxxxxxxxxxxxxx"
    "Content-Type"    = "application/json"
    "Idempotency-Key" = [guid]::NewGuid().ToString()
}

$body = @{
    to       = "+999000000001"
    senderId = "RANGE"
    message  = "Your verification code is 492018."
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "${baseUrl}/sms/send" -Method Post -Headers $headers -Body $body
$response | Format-List`;

      default:
        return '';
    }
  };

  const currentSnippet = generateSnippet(selectedLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-5 w-5 text-[#04648C] dark:text-[#FBCA07]" />
            Multi-Language SDKs & Code Snippets
          </h2>
          <p className="text-xs text-muted-foreground">
            Complete, tested code templates for 15+ modern languages targeting <code>{baseUrl}</code>
          </p>
        </div>

        {/* Language Select Dropdown */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as SupportedLanguage)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#04648C]"
            aria-label="Select Programming Language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Language Quick Tabs for Top Languages */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {LANGUAGES.slice(0, 8).map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => setSelectedLang(lang.id)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedLang === lang.id
                ? 'bg-[#04648C] text-white font-semibold shadow-xs dark:bg-[#FBCA07] dark:text-[#141B2D]'
                : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Code Display Box */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#07163D] shadow-xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#03102E] border-b border-border/40 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="h-4 w-4 text-[#FBCA07]" />
            <span>
              send_sms.{LANGUAGES.find((l) => l.id === selectedLang)?.extension || 'txt'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
              copied
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white font-medium border border-emerald-600 hover:border-emerald-700 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'
            }`}
            aria-label="Copy code snippet to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                <span className="text-white font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-5 overflow-x-auto text-slate-100 font-mono text-xs sm:text-sm leading-relaxed">
          <pre className="whitespace-pre">{currentSnippet}</pre>
        </div>
      </div>
    </div>
  );
}

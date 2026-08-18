<img width="772" height="250" alt="gronnfalk1" src="https://github.com/user-attachments/assets/c0f60459-d101-4240-bf7e-4c2945934c28" />


<p align="center">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" />
  <img src="https://img.shields.io/badge/Privacy--first-yes-brightgreen.svg" alt="Privacy-first: yes" />
  <img src="https://img.shields.io/github/last-commit/LiamProsser77/gronnfalk" alt="Last commit" />
</p>
<p align="center">
  <strong>"The simple soap search"</strong><br/>

<p align="center">
GronnFalk is an Norwegian, open-source, privacy-focused metasearch engine built for a simple and independent search experience. 

## Install

<h3> Run GronnFalk with Docker</h3>

<p>
  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white" alt="Docker Supported">
  </a>
</p>

<p>
  Run your own GronnFalk instance using Docker.
</p>

<h4>Requirements</h4>

<ul>
  <li>Docker</li>
  <li>Docker Compose</li>
  <li>The GronnFalk repository</li>
</ul>

<h4>Installation</h4>

<p>Clone the GronnFalk repository:</p>

<pre><code>git clone https://github.com/LiamProsser77/gronnfalk.git
cd gronnfalk</code></pre>

<p>Build and start GronnFalk:</p>

<pre><code>docker compose up -d --build</code></pre>

<p>
  Once Docker finishes, open:
</p>

<pre><code>http://localhost:8080</code></pre>

<p>Your own GronnFalk instance should now be running.</p>

<h4>Stop GronnFalk</h4>

<pre><code>docker compose down</code></pre>

<h4>Update GronnFalk</h4>

<pre><code>git pull
docker compose up -d --build</code></pre>

<h4>Docker Files</h4>

<ul>
  <li><code>Dockerfile</code> — Builds the GronnFalk Docker image.</li>
  <li><code>docker-compose.yml</code> — Runs the GronnFalk container.</li>
  <li><code>.dockerignore</code> — Excludes unnecessary files from the image.</li>
</ul>


## Deploy with Railway

<p align="center">
  <a href="https://railway.com/">
    <img src="https://img.shields.io/badge/Railway-Supported-8B5CF6?logo=railway&logoColor=white" alt="Railway Supported">
  </a>
</p>

Deploy your own GronnFalk instance with Railway.

1. Open Railway.
2. Select **Deploy from GitHub repo**.
3. Choose **GronnFalk**.
4. Click **Deploy**.

Railway will automatically use the included `Dockerfile`.

<h3> Deploy with Render</h3>

<p> <a href="https://render.com/deploy?repo=https://github.com/LiamProsser77/gronnfalk"> <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render"> </a> </p>

<p> Deploy your own GronnFalk instance to Render directly from GitHub. </p>

<h4>Requirements</h4>

<ul> <li>A GitHub account</li> <li>A Render account</li> </ul>

<h4>Installation</h4>

<ol> <li>Click the <strong>Deploy to Render</strong> button above.</li> <li>Sign in to Render with your GitHub account.</li> <li>Review the GronnFalk deployment settings.</li> <li>Click <strong>Apply</strong> or <strong>Deploy</strong>.</li> <li>Wait for Render to build and start your GronnFalk instance.</li> </ol>

<p> Once deployment is complete, Render will provide you with a URL for your own GronnFalk instance. </p>

<h4>Render Files</h4>

<ul> <li><code>render.yaml</code> — Configures the GronnFalk Render deployment.</li> </ul>

 ## About GronnFalk

GronnFalk was founded on **August 14, 2026**, from an unexpected source of inspiration: a bar of soap.

A unique texture inside the soap closely resembled the shape of what would eventually become the GronnFalk logo. That small coincidence sparked the idea behind the project and marked the beginning of GronnFalk.

Since then, GronnFalk has grown into a privacy-focused search engine built around **simplicity, privacy, and open development**.

The project is developed publicly on GitHub, where the community can explore the code, report issues, suggest ideas, and contribute.

**A search engine born from an unlikely inspiration.**

## Pronunciation

### GronnFalk

**English:** `/ˈɡrɒn.fɔːlk/` — **GRON-fawk**  
**Norwegian:** `/ˈɡrʊn.fɑlk/` — **GROON-falk**

**Simple pronunciation:** **GRON-falk**

The name **GronnFalk** was inspired by Norwegian-style naming, giving the project its distinctive sound and character. In English it means **Green Falcon**.

### License 

GronnFalk is licensed under the Apache License 2.0.






    

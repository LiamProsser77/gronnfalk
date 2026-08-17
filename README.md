<img width="772" height="250" alt="gronnfalk1" src="https://github.com/user-attachments/assets/c0f60459-d101-4240-bf7e-4c2945934c28" />


<p align="center">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" />
  <img src="https://img.shields.io/badge/Privacy--first-yes-brightgreen.svg" alt="Privacy-first: yes" />
  <img src="https://img.shields.io/github/last-commit/LiamProsser77/gronnfalk" alt="Last commit" />
</p>

#### GronnFalk is an open-source, privacy-focused metasearch engine built for a simple and independent search experience.

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
 





    

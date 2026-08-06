# 01 - Prepare New Machine (Linux Setup Guide)

This guide provides step-by-step instructions to set up a clean Linux machine (Ubuntu / Debian LTS) with all necessary development tools, runtimes, and container engines required to build, run, and manage the **AIPos / Crip-Crumbs** application stack.

---

## Table of Contents
1. [System Update & Base Dependencies](#1-system-update--base-dependencies)
2. [Git Setup & SSH Configuration](#2-git-setup--ssh-configuration)
3. [Node.js Setup (via NVM)](#3-nodejs-setup-via-nvm)
4. [Docker Engine & Docker Compose Installation](#4-docker-engine--docker-compose-installation)
5. [PostgreSQL Client Tools](#5-postgresql-client-tools)
6. [Firewall & Security Configuration (UFW)](#6-firewall--security-configuration-ufw)
7. [System Verification Checklist](#7-system-verification-checklist)

---

## 1. System Update & Base Dependencies

First, update system package lists and upgrade existing software to the latest versions. Then install fundamental build tools and network utilities.

```bash
# Update repository package indices and upgrade packages
sudo apt update && sudo apt upgrade -y

# Install core build utilities, curl, wget, ca-certificates, and software management tools
sudo apt install -y \
    build-essential \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    htop \
    unzip \
    jq
```

---

## 2. Git Setup & SSH Configuration

Configure your global Git identity and set up SSH keys for secure repository access.

### Set Global User Details
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### Generate SSH Key Pair (Optional for GitHub/GitLab authentication)
```bash
# Generate an Ed25519 SSH key
ssh-keygen -t ed25519 -C "your.email@example.com" -f ~/.ssh/id_ed25519 -N ""

# Start the SSH agent in the background and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Print public key to copy to GitHub/GitLab
cat ~/.ssh/id_ed25519.pub
```

---

## 3. Node.js Setup (via NVM)

We recommend using **NVM (Node Version Manager)** to install and manage Node.js versions cleanly without requiring `sudo` privileges.

### Step 3.1: Install NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Reload your shell configuration:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
source ~/.bashrc # or ~/.zshrc
```

### Step 3.2: Install Node.js LTS (v22 or v20)
```bash
# Install Node.js v22 LTS
nvm install 22

# Set v22 as default
nvm use 22
nvm alias default 22

# Verify installation
node -v
npm -v
```

### Step 3.3: Install Global Package Managers (Optional)
```bash
# Enable or install pnpm / yarn if needed
npm install -g pnpm
```

---

## 4. Docker Engine & Docker Compose Installation

Install official Docker Engine binaries (not the legacy OS `docker.io` package) along with the `docker-compose-plugin`.

### Step 4.1: Remove Old/Conflicting Docker Packages
```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove -y $pkg; done
```

### Step 4.2: Add Official Docker GPG Key & Repository
```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

### Step 4.3: Install Docker Engine, CLI, Containerd, and Compose Plugin
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 4.4: Configure Docker Group Permissions (Run without `sudo`)
To execute Docker commands without prefixing `sudo`:
```bash
# Create docker group if it doesn't exist
sudo groupadd docker 2>/dev/null || true

# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group membership changes immediately (or log out and back in)
newgrp docker
```

### Step 4.5: Enable Docker Service on Boot
```bash
sudo systemctl enable docker.service
sudo systemctl start docker.service

# Verify Docker service health
docker info
```

---

## 5. PostgreSQL Client Tools

Install command-line tools like `psql` to interact with local or containerized PostgreSQL databases directly from the host system.

```bash
# Install postgresql-client
sudo apt install -y postgresql-client

# Test psql CLI availability
psql --version
```

---

## 6. Firewall & Security Configuration (UFW)

Ensure basic system protection while allowing necessary traffic for SSH, web server ports, and local dev services.

```bash
# Allow SSH traffic (CRITICAL: Do not skip if managing remote server!)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp comment 'HTTP Nginx Frontend'
sudo ufw allow 443/tcp comment 'HTTPS'

# Allow local dev/production application ports (if needed publicly)
sudo ufw allow 3500/tcp comment 'Backend API'
sudo ufw allow 5000/tcp comment 'Frontend Web POS'

# Enable Firewall
sudo ufw enable

# Check UFW Status
sudo ufw status verbose
```

---

## 7. System Verification Checklist

Run this quick automated verification checklist to confirm all tools are correctly configured:

```bash
echo "=== SYSTEM VERIFICATION CHECKLIST ==="
echo -n "Git: " && git --version
echo -n "Node.js: " && node -v
echo -n "npm: " && npm -v
echo -n "Docker: " && docker --version
echo -n "Docker Compose: " && docker compose version
echo -n "PostgreSQL Client: " && psql --version
echo "====================================="
```

If all commands return valid version numbers without permission errors, your new Linux machine is fully prepared!

---

## Next Steps
- Proceed to [02-INSTALL-POSTGRES-DATABASE.md](file:///Users/tk-lpt-1088/development/react/crip-crumbs/documents/setup/database/02-INSTALL-POSTGRES-DATABASE.md) to set up PostgreSQL natively or via Docker.
- Proceed to [03-DOCKER-FRONTEND-BACKEND-SETUP.md](file:///Users/tk-lpt-1088/development/react/crip-crumbs/documents/setup/installation/03-DOCKER-FRONTEND-BACKEND-SETUP.md) to run the full application stack using Docker.

#!/usr/bin/env bash
set -euo pipefail

profile_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$profile_root"

profile_account="$(gh api user --jq .login)"
if [[ "$profile_account" != "flvvius" ]]; then
  printf 'Log in to GitHub as flvvius before publishing.\n' >&2
  exit 1
fi
if [[ "$(git branch --show-current)" != "main" ]]; then
  printf 'Switch to the reviewed main branch before publishing.\n' >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  printf 'Commit or review local changes before publishing.\n' >&2
  exit 1
fi

git push -u origin main

gh api --method PATCH user \
  -f bio='Software engineer. Into AI, business, and building products.' \
  -f blog='https://flavius.pro' --silent

gh repo edit flvvius/flvvius \
  --description 'Software, AI & business. My corner of the internet.'
gh repo edit flvvius/news \
  --description 'Romanian news, condensed into a feed you can finish. Web and mobile.'
gh repo edit flvvius/pricele \
  --description 'A daily game about what things cost around the world. One country, one item, five guesses.'
gh repo edit flvvius/Agro-Bot \
  --description 'A WhatsApp bot for Romanian farmers. Plant diagnosis, crop weather and cereal prices.'
gh repo edit flvvius/flavius-design-taste \
  --description 'My design taste as reusable skills for AI agents. Everyday interfaces and personal spaces.'
gh repo edit flvvius/commit-social \
  --description 'A social platform for companies. First place at the Adobe Hackathon 2025.'
gh repo edit flvvius/portofolio \
  --description 'My personal corner of the internet. Projects, notes and things I like.'

printf '\nPublished: https://github.com/flvvius\n'
printf 'On your profile, choose Customize your pins and select these repositories:\n'
printf 'news, pricele, Agro-Bot, flavius-design-taste, commit-social, portofolio\n'

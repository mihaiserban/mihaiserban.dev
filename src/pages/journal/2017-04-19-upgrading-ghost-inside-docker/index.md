---
title: "Upgrading Ghost Inside Docker"
---

Today, I was greeted with a message stating that a new version of ghost is available. Since this site is ran with [Docker](https://www.docker.com/), upgrading [Ghost](https://ghost.org/) is super simple. Without getting into more complex subjects such as Dockerfiles or Docker Compose, (which you will most definitely want to get familiar with if you get serious with containers) lets go through how to manually upgrading ghost using the office ghost image.

### Overview

This website is ran with two containers. One is [Caddy](https://caddyserver.com/), which acts as a webserver/ssl cert generator. The other is [Ghost](https://hub.docker.com/_/ghost/). In this post I'll disuss how I go about backing up and upgrading my Ghost container.

### Backup

First, we should backup our data in case anything goes wrong. If you host your sites on [AWS](https://aws.amazon.com/) or [Digital Ocean](https://www.digitalocean.com/), I suggest making an image snapshot of your instance. You can also tar up your data and download it locally.

### Export your data inside Ghost

Log in to the admin panel and navigate to the labs section. Once you are there, just click on the export button and export your data locally on your machine.

[snapshot]

Once finished, we can then proceed to upgrading our ghost container.

### What about my config.js?

Since containers are ephemeral, we need a way to save our config files to prevent reconfiguring every time we spin up a new container.

There are better ways of accomplishing this, but since I am still new to docker and containers, this will do for now.

My VM contains a folder with two directories. One folder is for Caddy, which includes my caddyfile. The other is for Ghost which includes my config.js, theme, and other data that needs to be mounted inside the new container.

[snapshot]

### Upgrading The Ghost Container

SSH into your server where your ghost container lives and pull in the new docker container for ghost:

```bash
$ docker pull ghost
```

Now list your docker images, we can see which one is the newest:

```bash
$ docker images
```

[snapshot]

We can shut down our currently running docker container:

```bash
$ docker stop ghost
```

You can either remove this container to avoid a naming conflict, or simply rename the container when you run the command below. Since I have no use for this container and all my data is backed up, I am going to just remove it.

```bash
$ docker rm ghost
```

Here's our docker command

```bash
$ docker run --env NODE_ENV=production --name ghost -p 8080:2368 -v /home/core/data/ghost:/var/lib/ghost ghost:latest
```

Here's a breakdown of the above

* `docker run`
  The command for running a docker container with argument following.
* `--env NODE_ENV`
  We're telling Ghost to start in production mode, rather than development.
* `--name`
  We're giving our container instance a name, ghost.
* `-p`
  We're telling docker to bind port 8080 to 2368. Caddy will serve up content from here.
* `-v`
  The volume that will be mounted into the container. This directory contains config.js, theme, etc.
* `ghost:latest`
  This is the container we want to use.

Once we run that command, docker will give us a long container id, we can run docker ps and see that our new container is up and running:
[snapshot]

Thats it! You now have the latest, greatest Ghost version :)

Cheers!

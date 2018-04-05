---
title: "Dotfile Management With GNU Stow"
---

**Introduction**

When I first started learning about dotfiles, one of the recurring topics I kept seeing was 'dotfile management'. There are a [plethora of ways](https://www.reddit.com/r/fossworldproblems/comments/2jk4gi/there_are_too_many_solutions_for_managing_dotfiles/) of solving this issue. I decided to keep things simple and use [GNU Stow](https://www.gnu.org/software/stow/).

A brief description of stow from the project site:

> GNU Stow is a symlink farm manager which takes distinct packages of software and/or data located in separate directories on the filesystem, and makes them appear to be installed in the same place. For example, /usr/local/bin could contain symlinks to files within /usr/local/stow/emacs/bin, /usr/local/stow/perl/bin etc.,

Apart from simplicity, I picked stow because its friendly to almost every \*nix environment, and doesn't require extra dependencies to be installed. I can easily keep a version controlled directory of my dotfiles.

Although stow is great for this use case, it's capabilities far extend the scope of this guide, we'll learn just some of the basics of what stow has to offer. So lets get started!

**Install Stow**

Stow is available for all linux and unix like distros via your package manager. Here are a couple ways to install it, choose which one applies to you:

MacOS (Homebrew)

```
$ brew install stow
```

Ubuntu (apt)

```
$ sudo apt-get install stow
```

CentOS (yum)

```
$ sudo yum install stow
```

Archlinux (pacman)

```
$ sudo pacman -S stow
```

Confirm that it installed:

```
$ stow --version
stow (GNU Stow) version 2.2.2
```

**Create a test directory**

Now that stow is installed, lets create a test directory with some dummy files:

```
$ cd && mkdir -p test/foo/ && mkdir test/bar/ && touch test/foo/.foo && touch test/bar/.bar
```

You'll now have have a folder named "test" in your home directory with two folders nested inside(foo, and bar). Each of those two folders contains a dummy file(.foo, and .bar). The command will also put you inside the /test folder once it is finished.

Here's how that directory structure looks (pre-stow)

```
.
├── bar
│   └── .bar
└── foo
    └── .foo
```

By default, stow will create symlinks for files/folders in the parent directory of where you execute the command. Lets now create our first symlink!

```
$ stow foo
```

Now go up a directory and ls -al to see what happened:

```
cd ../ && ls -al
total 8
drwxr-xr-x   4 jon  staff   136 Jan 15 20:31 .
drwx------+ 38 jon  staff  1292 Jan 15 19:37 ..
lrwxr-xr-x   1 jon  staff    13 Jan 15 20:30 .foo -> test/foo/.foo
drwxr-xr-x   4 jon  staff   136 Jan 15 20:27 test
```

You should now see a symlink pointing to the original file in the directory.

Lets run the same command on our older folder, bar. You'll need to run stow on each of the files/folders you wish to create symlinks for.

```
$ stow bar
```

Here's another way of viewing the directory:

```
.
├── .bar -> test/bar/.bar
├── .foo -> test/foo/.foo
└── test
    ├── bar
    │   └── .bar
    └── foo
        └── .foo
```

Here's how my dotfile directory looks:

```
.
├── git
│   ├── .gitattributes
│   ├── .gitconfig
│   ├── .gitconfig.local
│   ├── .gitignore
│   └── .stow-local-ignore
├── tmux
│   ├── .tmux
│   │   ├── .tmux.conf
│   │   └── .tmux.conf.local
│   ├── .tmux.conf
│   ├── .tmux.conf.local
│   └── .tmuxp
│       ├── 4pane.yaml
│       └── js-frontend.yaml
├── nvim
│   └── .config
│       └── nvim
│           ├── .DS_Store
│           ├── .netrwhist
│           ├── autoload
│           │   └── plug.vim
│           ├── config
│           │   ├── color.vimrc
│           │   ├── general.vimrc
│           │   ├── init.vimrc
│           │   ├── keys.vimrc
│           │   ├── line.vimrc
│           │   └── plugins.vimrc
│           └── init.vim
└── zsh
    ├── .zsh
    │   ├── environment.zsh
    │   ├── history.zsh
    │   └── nodejs.zsh
    └── .zshrc
```

I'm working on making my vim directory a little less complex. Instead of having hundreds of lines of code in my .vimrc, I decided to modularise them for organisational purposes.

**Backups + SVC**

At this point, we could add git to our directory to handle versioning and backups. Im an advocate for making your dotfiles public, that way others can observe and learn from your set up. Check out some awesome dotfile repos here: https://dotfiles.github.io/

**Wrapping up**

I haven't quite mastered the art of dotfile management, but stow has certainly helped me get one step closer. In the future, I would like to make my dotfiles portable enough so that, with the help of some bash scripting, my environment could be pulled from my repo and set up in any linux environment via ssh.

That about sums up how I use stow to manage my dotfiles. You can view my dotfile repo here: https://github.com/jonleopard/dotfiles

I'm still working on the installation scripts and documentation, (in fact, I could use some help making those scripts since I'm still a n00b) so be cautious if you are going to duplicate anything of mine.

I hope this post helped you understand stow and dotfile management a little more.

Cheers!

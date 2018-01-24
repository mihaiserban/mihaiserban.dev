---
title: "New Machine Setup Automation"
---


Just wanted to write a quick post about small project I'm working on. I'm writing my first bash script and its purpose is to completely take care of setting  up a new machine (Mac or linux). 

Here it is: [install.sh](https://github.com/jonleopard/dotfiles/blob/master/install.sh)

**Description**
Since I use both Mac and Linux, I wanted my dotfiles to be as portable as possible. I chose to use [stow](https://www.gnu.org/software/stow/) since its platform agnostic, and very easy to use/setup.

Script will look inside your home directory first and backup any existing dotfiles (just to be safe). Then it will look at your kernel and decide what to do next. [Homebrew](https://brew.sh/) will install all the packages I have defined in the brew.sh file. This only applies to MacOS systems. If I'm on linux, then I just need to install a few dependencies (some of which will be defined in vim-install.sh). 


You might be thinking, "Uh, why not just git pull your dotfile repo and stow whatever dotfiles you want to use??". Well, you could totally do that if you don't mind manually setting up the rest of your dependencies and plugin managers. I just wanted to make something completely automated. It might be silly, but hey, its a learning experience!



**Goals**
If people like this approach of managing dotfiles, zsh & vim plugins, then it might be cool to just set up a bare-bones branch but strips away my customisations, therefore allowing the user to build their own dotfile repo.

The bare-bones edition would most likely just be:

* GNU stow
* vim OR neovim
* bash OR zsh
* if zsh then install zplug

From there, you'd just go in and install your vim/zsh plugins and start git inside ./dotfiles.



**Todo**

* Finish mac testing
* Finish vim-install.sh
* Implement a chsh command for switching shells (if * installing/using zsh)
* Finish linux commands and test in Ubuntu env\
* Once finished, cleanup README.md and write installation instructions.


Take a look at the file and let me know what you think! If you like what's been made so far, then feel free to contribute :)


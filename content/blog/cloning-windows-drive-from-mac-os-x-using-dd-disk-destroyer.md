---
slug: cloning-windows-drive-from-mac-os-x-using-dd-disk-destroyer
title: Cloning a Windows drive from Mac OS X using dd (Disk Destroyer)
description: "Decided to upgrade upgrade my Windows drive on my dual boot Hackintosh. Here's how to do it from your Mac OS X drive using dd (Disk Destroyer)."
date: "2021-01-08T00:00+02:00"
hidden: false
tags: []
---

Decided to upgrade upgrade my Windows drive on my dual boot Hackintosh. Here's how to do it from your Mac OS X drive.

![nvme-drives](//images.ctfassets.net/usz05rcag1x3/7pwq8YpjR0jJW58lvso315/70d49dec3ab877dfd889dda9bc029bbd/IMG_4666.jpg)

Open your terminal. Run ```diskutil list``` to get the disk identifier you want to migrate.

```diskutil list```

In my case the Windows drive is ```/dev/disk1```.

Let's clone the drive using ```dd```. Set input file to the drive you want to clone, make sure to add ```r```, makes it faster. Set output file to a ```.iso``` location of your choice.
This operation will take a couple of hours.

```sudo dd if=/dev/rdisk1 of=/Users/mitzuuuu/Desktop/windows.iso```

Install your empty drive and run ```diskutil list``` again to get the identifier of the new drive, ```/dev/disk0``` in my case.

Write the .iso you've previously generated to the new installed drive. 
This operation will take a couple of hours.

```sudo dd if=/Users/mitzuuuu/Desktop/windows.iso of=/dev/disk0```

After the migration is done, you need to take care of the ```Unnalocated space```. Boot into the Windows partition. Create a new partition, and finally merge it with the master windows partition if you want to.

Success!


---
slug: cloning-windows-drive-from-mac-os-x-using-dd-disk-destroyer
title: Cloning a Windows Drive from macOS with dd
description: "How I copied a Windows drive on a dual-boot Hackintosh using a raw disk image, with checks before writing to the destination drive."
date: "2021-01-08T00:00+02:00"
hidden: false
tags: []
---

I decided to upgrade my Windows drive on my dual-boot Hackintosh. Here is how I did it from macOS using `dd`.

> **Updated 2026-09-13:** `dd` makes a raw disk image, not an ISO installer image. The commands below can irreversibly overwrite a disk. Confirm every identifier with `diskutil list`, unmount the whole disk before copying, and replace the placeholders only after checking them.

Open your terminal. Run `diskutil list` to get the disk identifier you want to migrate.

```sh
diskutil list
```

In my case the Windows drive is `/dev/disk1`.

Unmount that disk, then clone it with `dd`. The `r` in `/dev/rdisk1` selects macOS's raw device, which can improve copying throughput. Save the output as a `.img` file on a different physical disk from the source, with enough free space. This can take hours.

```
diskutil unmountDisk /dev/disk1
sudo dd if=/dev/rdisk1 of=/Users/mitzuuuu/Desktop/windows-drive.img bs=4m
shasum -a 256 /Users/mitzuuuu/Desktop/windows-drive.img
```

Install the empty drive and run `diskutil list` again to get its identifier. Do not assume it will be the same identifier as a previous drive. Its capacity must be at least as large as the source image.

Unmount the destination disk, then write the image. This operation can also take hours.

```
diskutil unmountDisk /dev/disk0
sudo dd if=/Users/mitzuuuu/Desktop/windows-drive.img of=/dev/rdisk0 bs=4m
```

`of=` is the destination. A wrong value overwrites that disk. The checksum records the image you created; keep it with the image so you can check the file before a later restore.

After migration is done, take care of the unallocated space in Windows Disk Management. You can extend the Windows volume only when the unallocated space is adjacent to it and the partition layout permits it.

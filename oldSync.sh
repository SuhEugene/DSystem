rsync -vzuhr --progress -e 'ssh -i ~/.ssh/centos -p 49252' /home/suheugene/projects/dsystem/ root@ovz4.suheugene.m69km.vps.myjino.ru:/root/DBank --exclude ".nuxt" --exclude "node_modules" --exclude ".git" --exclude "*.sh"
rsync -vzuhr --progress -e 'ssh -i ~/.ssh/centos -p 49252' /mnt/c/projects/DSystem/ root@ovz4.suheugene.m69km.vps.myjino.ru:/root/DBank --exclude ".nuxt" --exclude "node_modules" --exclude ".git" --exclude "*.sh"

sh serverSync.sh;
ssh -i ~/.ssh/sups suheugene@134.209.234.162 "sh /home/suheugene/bld/do.sh";
sh download.sh;
ssh -i ~/.ssh/sups suheugene@134.209.234.162 "sh /home/suheugene/bld/rmd.sh";
sh send.sh;
#sh ~/vserver.sh;


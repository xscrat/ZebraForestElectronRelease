echo "******************* begin deploy"
ls node_modules &> /dev/null
if [ $? != 0 ]; then
	tar xvf node_modules.tar.gz
fi
echo "******************* begin install serial"
pip3 freeze | grep serial &> /dev/null
if [ $? != 0 ]; then
	sudo apt-get -y install python3-pip
	sudo pip3 install serial
fi
echo "******************* begin install node.js"
which node | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo apt-get -y install nodejs
fi
sudo ln -s /usr/bin/nodejs /usr/bin/node
echo "******************* begin install npm"
which npm | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo apt-get -y install npm
fi
echo "******************* begin start"
node_modules/electron/cli.js .


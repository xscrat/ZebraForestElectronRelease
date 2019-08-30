echo "******************* begin deploy"
cat /etc/apt/sources.list | grep 'ali' &> /dev/null
if [ $? != 0 ]; then
	sudo mv /etc/apt/sources.list /etc/apt/sources.list.bak
	sudo cp sources.list /etc/apt/sources.list
	echo "******************* begin update"
	sudo apt-get update
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
echo "******************* begin install cnpm"
which cnpm | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo npm install -g cnpm@4.1.0 --registry=https://registry.npm.taobao.org
fi
echo "******************* begin install electron"
which electron | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo cnpm install -g electron@6.0.0 --registry=https://registry.npm.taobao.org
fi
echo "******************* begin install serial"
sudo apt-get -y install python3-pip
sudo pip3 install serial
echo "******************* begin start"
electron .


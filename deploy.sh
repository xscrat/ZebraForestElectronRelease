cat /etc/apt/sources.list | grep 'ali' &> /dev/null
if [ $? != 0 ]; then
	sudo mv /etc/apt/sources.list /etc/apt/sources.list.bak
	sudo cp sources.list /etc/apt/sources.list
	sudo apt-get update
fi
which node | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo apt-get -y install node.js
fi
sudo ln -s /usr/bin/nodejs /usr/bin/node
which npm | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo apt-get -y install npm
fi
which cnpm | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo npm install -g cnpm@4.1.0 --registry=https://registry.npm.taobao.org
fi
which electron | grep / &> /dev/null
if [ $? != 0 ]; then
	sudo cnpm install -g electron@6.0.0 --registry=https://registry.npm.taobao.org
fi
sudo apt-get -y install python-pip
sudo pip install serial
electron .


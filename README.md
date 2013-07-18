[![Stories in Ready](http://badge.waffle.io/thoop/swg-login-server-node.png)](http://waffle.io/thoop/swg-login-server-node)  
Bare minimum of a Star Wars Galaxies login server written in NodeJS

To Run the Server
------------------

`node server.js`

To connect to the login server From a Star Wars Galaxies game client
------------------

1. Install SWG (on a windows box or VM)
2. Install SWGEmu launchpad to get your client updated to patch 14.1 (Pre-CU) [SWGEmu Launchpad installation guide](http://www.swgemu.com/forums/content.php?r=179-Install-SWGEmu)
3. Open C:/SWGEmu/swgemu_login.cfg
4. Change loginServerAddress0 to the ip of the machine running your login server
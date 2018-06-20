clean:
	rm -Rf /tmp/peer*

run:
	node examples/node-two-peers/index.js

log-run:
	DEBUG=bitswap:* node examples/node-two-peers/index.js

log-bitswap-run:
	DEBUG=bitswap:* node examples/node-two-peers/index.js

log-engine-run:
	DEBUG=bitswap:engine:* node examples/node-two-peers/index.js

inspect-run:
	node --inspect-brk examples/node-two-peers/index.js

random1:
	dd if=/dev/urandom of=/tmp/1m.data bs=1M count=1

random10:
	dd if=/dev/urandom of=/tmp/10m.data bs=1M count=10

random100:
	dd if=/dev/urandom of=/tmp/100m.data bs=1M count=100

SERIALPORT=/dev/cu.Cubelet-RGB-AMP-SPP# Paired Bluetooth Cubelet
CUBELETS=40834 30241# List of Cubelet IDs to control

leap:
	node leap $(SERIALPORT) $(CUBELETS)

.PHONY: leap

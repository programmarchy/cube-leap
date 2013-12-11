SERIALPORT=/dev/cu.Moss-PWG-AMP-SPP# Paired Moss Brain
FACES=1 3# List of Moss Brain faces to control

leap:
	node leap $(SERIALPORT) $(FACES)

.PHONY: leap

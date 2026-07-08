package service

import (
	"golang.org/x/crypto/ssh"
	"golang.org/x/crypto/ssh/knownhosts"
)

func knownHostsCallback(path string) (ssh.HostKeyCallback, error) {
	return knownhosts.New(path)
}

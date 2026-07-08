Letakkan private key SSH (yang public key-nya sudah didaftarkan ke
`~/.ssh/authorized_keys` user `pgbouncer_ctl` di server PgBouncer remote)
sebagai file bernama `pgb_ssh_key` di folder ini.

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
# lalu copy pgb_ssh_key.pub ke server PgBouncer:
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-server-pgbouncer>
```

Jangan commit isi folder ini ke git (sudah ada di .gitignore).

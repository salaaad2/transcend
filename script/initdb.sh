#!/usr/bin/env bash
docker exec postgres /usr/bin/psql -U admin -d nestjs -c "INSERT INTO public.user (username, password, wins, losses, friendlist, blocklist, elo, status, chanslist, avatar) VALUES (
'admin', 'admin', '100', '100', '{}', '{}', '100000', 'offline', '{General}', '');
INSERT INTO public.channel (name, admin, password) VALUES ('General', 'admin', 'null');"
# INSERT INTO public.message (author, content, channelId) VALUES ('admin', 'Bienvenue !', '1');"

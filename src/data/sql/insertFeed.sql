insert into freed.feed_list(id, url)
values(uuid_generate_v4(), $1)
returning url;
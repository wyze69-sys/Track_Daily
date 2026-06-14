# FitSync MySQL Backup Notes

Create a local backup:

```bash
mysqldump -u root -p -P 8889 track_daily > track_daily_backup.sql
```

Restore a local backup:

```bash
mysql -u root -p -P 8889 track_daily < track_daily_backup.sql
```

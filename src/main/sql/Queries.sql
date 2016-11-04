select COUNT(*) FROM waypoint;
select COUNT(*),  EXTRACT(year FROM date) as year FROM waypoint GROUP BY year;


select COUNT(*),  EXTRACT(year FROM date) as year, EXTRACT(month FROM date) as month FROM waypoint WHERE EXTRACT(year FROM date) = 2015 GROUP BY year, month ORDER BY month;

select COUNT(*),  EXTRACT(year FROM date) as year, EXTRACT(month FROM date) as month, EXTRACT(day FROM date) as day FROM waypoint WHERE EXTRACT(year FROM date) = 2015 GROUP BY year, month, day ORDER BY month;

select COUNT(*) as count,  EXTRACT(year FROM date) as year, EXTRACT(month FROM date) as month, EXTRACT(day FROM date) as day FROM waypoint WHERE EXTRACT(year FROM date) = 2015 GROUP BY year, month, day HAVING COUNT(*) < 240 ORDER BY month;

select COUNT(*) as count,  EXTRACT(year FROM date) as year, EXTRACT(month FROM date) as month, EXTRACT(day FROM date) as day FROM waypoint WHERE EXTRACT(year FROM date) = 2015 GROUP BY year, month, day HAVING COUNT(*) > 1500 ORDER BY month;


select COUNT(*),  date::timestamp::date FROM waypoint WHERE EXTRACT(year FROM date) = 2015 GROUP BY date::timestamp::date ORDER BY date::timestamp::date;


select COUNT(*) as count, name FROM waypoint, region WHERE ST_WITHIN(point, geometry) GROUP BY name ORDER BY count DESC;
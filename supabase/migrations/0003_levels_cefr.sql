-- Switch level vocabulary from A1.1/A1.2/A2.1/A2.2 to A1/A2/B1/B2.
-- Mapping: A1.1 -> A1, A1.2 -> A2, A2.1 -> B1, A2.2 -> B2.

alter table public.courses drop constraint if exists courses_level_check;
alter table public.certificates drop constraint if exists certificates_level_check;

update public.courses
set level = case level
  when 'A1.1' then 'A1'
  when 'A1.2' then 'A2'
  when 'A2.1' then 'B1'
  when 'A2.2' then 'B2'
  else level
end;

update public.certificates
set level = case level
  when 'A1.1' then 'A1'
  when 'A1.2' then 'A2'
  when 'A2.1' then 'B1'
  when 'A2.2' then 'B2'
  else level
end;

alter table public.courses
  add constraint courses_level_check check (level in ('A1', 'A2', 'B1', 'B2'));

alter table public.certificates
  add constraint certificates_level_check check (level in ('A1', 'A2', 'B1', 'B2'));

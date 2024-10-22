::  %live's state replication
::
/-  *live
::
|%
++  records
  |%
  ++  name  %live-records
  +$  rock  record=record
  +$  wave  record=record
  ++  wash
    |=  [=rock =wave]
    rock(record record.wave)
  --
::
++  records-1
  |%
  ++  name  %live-records-1
  +$  rock  record=record-1
  +$  wave  record=record-1
  ++  wash
    |=  [=rock =wave]
    rock(record record.wave)
  --
--

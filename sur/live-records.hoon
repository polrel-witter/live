::  record state replication
::
/-  *live
|%
++  name  %live-records
+$  rock  records=(map id record)
+$  wave  [=id =record]
++  wash
  |=  [=rock =wave]
  rock(records (~(put by records.rock) id.wave record.wave))
--

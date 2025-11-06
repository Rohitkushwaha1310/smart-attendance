import {createClient} from "@supabase/supabase-js"

const supabase=createClient(

'https://dnkxbzdurtynpvhtlhrs.supabase.co',
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua3hiemR1cnR5bnB2aHRsaHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzYwMTMsImV4cCI6MjA3NzgxMjAxM30.egnUt837mUzzQa1FePwrfBs1dQFl0wrQznDOBhU9OgQ'
)

export default supabase;
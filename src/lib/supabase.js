import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ybdzzhkpywpqeqhcfdfc.supabase.co";
const supabaseKey = "sb_publishable_EPhieQpQw17ZXpERWJLUWA_-rsRr6rt";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
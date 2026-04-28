import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://omrrvmftmojsogeuwuje.supabase.co";
const supabaseAnonKey = "sb_publishable_1WxsuzGLV4gkhghXi6YDYg_Ng-EskS3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
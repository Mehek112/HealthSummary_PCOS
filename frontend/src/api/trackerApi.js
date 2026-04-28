import { supabase } from "../supabaseClient";

export const saveTrackerEntry = async (entry) => {
  const { data, error } = await supabase
    .from("pcos_entries")
    .insert([entry])
    .select();

  if (error) throw error;
  return data;
};

export const getTrackerHistory = async (userId) => {
  const { data, error } = await supabase
    .from("pcos_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
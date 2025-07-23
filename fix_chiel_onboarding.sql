-- Fix Chiel's onboarding status to completed
-- Run this in Supabase SQL Editor

UPDATE user_onboarding_status 
SET 
  onboarding_completed = true,
  goal_set = true,
  missions_selected = true,
  training_schema_selected = true,
  nutrition_plan_selected = true,
  challenge_started = true,
  completed_steps = '["goal", "missions", "training", "nutrition", "challenge"]'
WHERE user_id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; 
import { useState, useEffect, useCallback } from 'react'
import { getSupabase, isConfigured } from '../lib/supabase'

export function useSupabase() {
  const [configured, setConfigured] = useState(isConfigured())
  const [error, setError] = useState(null)
  
  const checkConfig = useCallback(() => {
    setConfigured(isConfigured())
  }, [])
  
  const query = useCallback(async (table, options = {}) => {
    if (!isConfigured()) {
      throw new Error('Supabase not configured. Run "setup" command.')
    }
    
    try {
      const supabase = getSupabase()
      let query = supabase.from(table).select(options.select || '*')
      
      if (options.eq) {
        query = query.eq(options.eq.column, options.eq.value)
      }
      
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? false 
        })
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])
  
  const insert = useCallback(async (table, data) => {
    if (!isConfigured()) {
      throw new Error('Supabase not configured. Run "setup" command.')
    }
    
    try {
      const supabase = getSupabase()
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])
  
  const update = useCallback(async (table, id, data) => {
    if (!isConfigured()) {
      throw new Error('Supabase not configured. Run "setup" command.')
    }
    
    try {
      const supabase = getSupabase()
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])
  
  const remove = useCallback(async (table, id) => {
    if (!isConfigured()) {
      throw new Error('Supabase not configured. Run "setup" command.')
    }
    
    try {
      const supabase = getSupabase()
      const { error } = await supabase.from(table).delete().eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])
  
  return { configured, error, query, insert, update, remove, checkConfig }
}

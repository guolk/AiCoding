const express = require('express');
const router = express.Router();

router.get('/settings', (req, res) => {
  req.db.get('SELECT * FROM cost_settings ORDER BY updated_at DESC LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

router.put('/settings', (req, res) => {
  const { electricity_rate, printer_power, printer_lifespan_hours, printer_cost, labor_cost_per_hour, markup_percentage } = req.body;
  
  const sql = `UPDATE cost_settings SET 
    electricity_rate = ?, printer_power = ?, printer_lifespan_hours = ?, 
    printer_cost = ?, labor_cost_per_hour = ?, markup_percentage = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1`;
  
  req.db.run(sql, [electricity_rate, printer_power, printer_lifespan_hours, printer_cost, labor_cost_per_hour, markup_percentage], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: 1, ...req.body });
    });
});

router.get('/calculate/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  
  const sql = `SELECT p.*, f.price as filament_price, f.initial_weight as filament_initial_weight
               FROM print_projects p
               LEFT JOIN filaments f ON p.filament_id = f.id
               WHERE p.id = ?`;
  
  req.db.get(sql, [projectId], (err, project) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    req.db.get('SELECT * FROM cost_settings ORDER BY updated_at DESC LIMIT 1', (err, settings) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const filament_cost = project.filament_used && project.filament_price && project.filament_initial_weight
        ? (project.filament_used / project.filament_initial_weight) * project.filament_price
        : 0;
      
      const electricity_cost = project.print_duration && settings.electricity_rate && settings.printer_power
        ? (project.print_duration / 60) * (settings.printer_power / 1000) * settings.electricity_rate
        : 0;
      
      const wear_cost = project.print_duration && settings.printer_lifespan_hours && settings.printer_cost
        ? (project.print_duration / 60) * (settings.printer_cost / settings.printer_lifespan_hours)
        : 0;
      
      const total_cost = filament_cost + electricity_cost + wear_cost;
      
      const suggested_price = total_cost * (1 + (settings.markup_percentage || 50) / 100);
      
      res.json({
        project_id: project.id,
        project_name: project.name,
        breakdown: {
          filament_cost: parseFloat(filament_cost.toFixed(2)),
          electricity_cost: parseFloat(electricity_cost.toFixed(2)),
          wear_cost: parseFloat(wear_cost.toFixed(2))
        },
        total_cost: parseFloat(total_cost.toFixed(2)),
        suggested_price: parseFloat(suggested_price.toFixed(2)),
        settings_used: {
          electricity_rate: settings.electricity_rate,
          printer_power: settings.printer_power,
          printer_lifespan_hours: settings.printer_lifespan_hours,
          printer_cost: settings.printer_cost,
          markup_percentage: settings.markup_percentage
        }
      });
    });
  });
});

router.post('/calculate', (req, res) => {
  const { filament_used, filament_price, filament_initial_weight, print_duration } = req.body;
  
  req.db.get('SELECT * FROM cost_settings ORDER BY updated_at DESC LIMIT 1', (err, settings) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const filament_cost = filament_used && filament_price && filament_initial_weight
      ? (filament_used / filament_initial_weight) * filament_price
      : 0;
    
    const electricity_cost = print_duration && settings.electricity_rate && settings.printer_power
      ? (print_duration / 60) * (settings.printer_power / 1000) * settings.electricity_rate
      : 0;
    
    const wear_cost = print_duration && settings.printer_lifespan_hours && settings.printer_cost
      ? (print_duration / 60) * (settings.printer_cost / settings.printer_lifespan_hours)
      : 0;
    
    const total_cost = filament_cost + electricity_cost + wear_cost;
    const suggested_price = total_cost * (1 + (settings.markup_percentage || 50) / 100);
    
    res.json({
      breakdown: {
        filament_cost: parseFloat(filament_cost.toFixed(2)),
        electricity_cost: parseFloat(electricity_cost.toFixed(2)),
        wear_cost: parseFloat(wear_cost.toFixed(2))
      },
      total_cost: parseFloat(total_cost.toFixed(2)),
      suggested_price: parseFloat(suggested_price.toFixed(2))
    });
  });
});

router.get('/summary', (req, res) => {
  const period = req.query.period || 'all';
  
  let dateFilter = '';
  if (period === 'month') {
    dateFilter = "WHERE p.print_date >= date('now', '-1 month')";
  } else if (period === 'week') {
    dateFilter = "WHERE p.print_date >= date('now', '-7 days')";
  }
  
  const sql = `SELECT 
    COUNT(*) as total_projects,
    SUM(p.filament_used) as total_filament_used,
    SUM(p.print_duration) as total_print_minutes,
    AVG(p.success_rate) as avg_success_rate
    FROM print_projects p
    ${dateFilter}`;
  
  req.db.get(sql, (err, summary) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    req.db.get('SELECT * FROM cost_settings ORDER BY updated_at DESC LIMIT 1', (err, settings) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const total_hours = (summary.total_print_minutes || 0) / 60;
      const estimated_electricity_cost = total_hours * (settings.printer_power / 1000) * settings.electricity_rate;
      const estimated_wear_cost = total_hours * (settings.printer_cost / settings.printer_lifespan_hours);
      
      res.json({
        period,
        projects: {
          total: summary.total_projects || 0,
          avg_success_rate: parseFloat((summary.avg_success_rate || 0).toFixed(1))
        },
        filament: {
          total_used: parseFloat((summary.total_filament_used || 0).toFixed(1))
        },
        printing: {
          total_hours: parseFloat(total_hours.toFixed(1))
        },
        estimated_costs: {
          electricity: parseFloat(estimated_electricity_cost.toFixed(2)),
          wear: parseFloat(estimated_wear_cost.toFixed(2)),
          total: parseFloat((estimated_electricity_cost + estimated_wear_cost).toFixed(2))
        }
      });
    });
  });
});

module.exports = router;
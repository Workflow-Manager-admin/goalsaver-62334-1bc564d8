import React, { useState } from 'react';
import './App.css';

// Color scheme
const COLORS = {
  primary: '#4CAF50', // Green (main)
  secondary: '#FFC107', // Yellow/orange (secondary)
  accent: '#2196F3', // Blue (progress, UI pops)
  text: '#212121',
  lightBg: '#f6f8fa',
};

// ---- GOAL FORM ----
// PUBLIC_INTERFACE
function GoalForm({ onAddGoal }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [income, setIncome] = useState('');
  const [spending, setSpending] = useState('');

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;
    // Smart Contribution Calculation (example: 20% of free income, minimum for plan)
    const monthlyFree = income && spending ? Math.max(Number(income) - Number(spending), 0) : 0;
    const months = monthDiff(new Date(), new Date(deadline));
    const minMonthly = Math.ceil(Number(targetAmount) / (months > 0 ? months : 1));
    const smartMonthly = income && spending
      ? Math.min(Math.ceil(monthlyFree * 0.2), minMonthly)
      : minMonthly;

    onAddGoal({
      name,
      targetAmount: Number(targetAmount),
      deadline,
      income: Number(income),
      spending: Number(spending),
      monthlyContribution: smartMonthly,
      saved: 0,
      history: [],
      reminders: [],
      created: new Date().toISOString(),
    });
    setName('');
    setTargetAmount('');
    setDeadline('');
    setIncome('');
    setSpending('');
  }

  // PUBLIC_INTERFACE
  function monthDiff(d1, d2) {
    const diff =
      d2.getFullYear() * 12 +
      d2.getMonth() -
      (d1.getFullYear() * 12 + d1.getMonth());
    return diff + 1;
  }

  return (
    <form className="gs-form" onSubmit={handleSubmit}>
      <h2 className="gs-section-title">Add New Goal</h2>
      <div className="gs-form-row">
        <input
          className="gs-input"
          placeholder="Goal name (e.g. New Laptop)"
          value={name}
          required
          onChange={e => setName(e.target.value)}
          maxLength={32}
        />
      </div>
      <div className="gs-form-row">
        <input
          className="gs-input"
          type="number"
          placeholder="Target amount (₹)"
          value={targetAmount}
          required
          min="1"
          onChange={e => setTargetAmount(e.target.value)}
        />
        <input
          className="gs-input"
          type="date"
          placeholder="Target date"
          value={deadline}
          required
          onChange={e => setDeadline(e.target.value)}
        />
      </div>
      <div className="gs-form-row">
        <input
          className="gs-input"
          type="number"
          placeholder="Monthly income (optional)"
          value={income}
          min="0"
          onChange={e => setIncome(e.target.value)}
        />
        <input
          className="gs-input"
          type="number"
          placeholder="Monthly spending (optional)"
          value={spending}
          min="0"
          onChange={e => setSpending(e.target.value)}
        />
      </div>
      <button className="btn gs-btn-primary" type="submit">Add Goal</button>
    </form>
  );
}

// ---- GOAL LIST & PROGRESS ----
// PUBLIC_INTERFACE
function GoalList({ goals, onDeposit, onDelete, onHabit, onPrioritize }) {
  if (!goals.length) {
    return <div style={{ margin: '32px auto', color: COLORS.accent, textAlign: 'center' }}>Start by adding your first goal!</div>;
  }
  return (
    <div style={{ margin: '32px 0' }}>
      <h2 className="gs-section-title" style={{ marginBottom: 16 }}>Your Goals</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {goals.map((g, idx) =>
          <GoalCard
            key={g.created}
            goal={g}
            index={idx}
            onDeposit={onDeposit}
            onDelete={onDelete}
            onHabit={onHabit}
            onPrioritize={onPrioritize}
            totalGoals={goals.length}
          />
        )}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function GoalCard({ goal, index, onDeposit, onDelete, onHabit, onPrioritize, totalGoals }) {
  const progress = Math.min(100, Math.round((goal.saved / goal.targetAmount) * 100));
  const monthsLeft = Math.max(1, monthDiff(new Date(), new Date(goal.deadline)));
  const recommended = Math.ceil(goal.targetAmount / monthsLeft);

  // Calculate what user should be saving this month
  const suggestedMonthly = goal.monthlyContribution || recommended;

  // PUBLIC_INTERFACE
  function monthDiff(d1, d2) {
    const diff =
      d2.getFullYear() * 12 +
      d2.getMonth() -
      (d1.getFullYear() * 12 + d1.getMonth());
    return diff + 1;
  }

  return (
    <section className="gs-goal-card"
      style={{
        background: COLORS.lightBg,
        borderLeft: `6px solid ${COLORS.primary}`,
      }}>
      <div className="gs-goal-header">
        <strong style={{ fontSize: 18 }}>{goal.name}</strong>
        <div>
          <button title="Prioritize Up" className="gs-prio-btn"
            style={{marginRight: 4}} disabled={index === 0}
            onClick={() => onPrioritize(index, -1)}>↑</button>
          <button title="Prioritize Down" className="gs-prio-btn"
            disabled={index === totalGoals-1}
            onClick={() => onPrioritize(index, 1)}>↓</button>
          <button className="gs-delete-btn" onClick={() => onDelete(index)} title="Delete Goal">✕</button>
        </div>
      </div>
      <div className="gs-goal-details">
        <div style={{minWidth: 130}}>
          <span className="gs-goal-label">Target:</span> ₹{goal.targetAmount}
        </div>
        <div style={{minWidth: 130}}>
          <span className="gs-goal-label">Saved:</span> ₹{goal.saved}
        </div>
        <div>
          <span className="gs-goal-label">Deadline:</span>{' '}
          {goal.deadline}
        </div>
      </div>
      <div className="gs-progress-box">
        <ProgressBar percent={progress} />
        <span style={{ marginLeft: 12, color: COLORS.primary, fontWeight: 600 }}>
          {progress}% achieved
        </span>
      </div>
      <div style={{marginTop: 10, display:'flex', alignItems: 'flex-end', gap: 18}}>
        <form onSubmit={e => {
          e.preventDefault();
          const val = e.target.amount.value;
          if (!val || isNaN(val) || val <= 0) return;
          onDeposit(index, Number(val));
          e.target.amount.value = '';
        }} style={{ display:'flex', gap: 6 }}>
          <input name="amount" className="gs-input-sm" placeholder="₹ Amount" type="number" min="1" max={goal.targetAmount-goal.saved} />
          <button className="btn gs-btn-accent" type="submit">+ Add</button>
        </form>
        <span className="gs-smart-tip">
          <span style={{ fontSize: 13 }}>Suggest: ₹{suggestedMonthly}/month</span>
        </span>
        <button className="gs-btn-habit" onClick={() => onHabit(index)}>💡 Add to Habit/Reminder</button>
      </div>
      {goal.history?.length > 0 && (
        <div className="gs-history">
          <span className="gs-goal-label">History: </span>
          {goal.history.slice(-3).map((amt, i) => <span key={i} className="gs-hist-amt">+₹{amt}</span>)}
        </div>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function ProgressBar({ percent }) {
  return (
    <div className="gs-progress-bar-outer">
      <div
        className="gs-progress-bar-inner"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary} 90%)`,
        }}
      />
    </div>
  );
}

// ---- REMINDERS / HABITS ----
// PUBLIC_INTERFACE
function RemindersPanel({ goals, onClearHabit }) {
  const habitGoals = goals.filter(g => g.reminders && g.reminders.length > 0);
  if (!habitGoals.length) return null;
  return (
    <div style={{ margin: '28px 0'}}>
      <h2 className="gs-section-title">Reminders & Habit Builder</h2>
      <ul className="gs-reminder-list">
        {habitGoals.map((g, idx) => (
          <li key={g.created} className="gs-reminder-item">
            Set habit for <b>{g.name}</b>: 
            &nbsp; {g.reminders.at(-1)?.desc ?? 'Micro-save regularly!'}
            <button className="gs-btn-clear" onClick={() => onClearHabit(g.created)}>
              Clear
            </button>
          </li>
        ))}
      </ul>
      <div className="gs-reminder-hint">
        <span style={{color: COLORS.secondary}}>⏰</span> Use calendar or digital reminders on your device to build micro-saving habits for your goals!
      </div>
    </div>
  );
}

// ---- MAIN APP ----
/**
 * PUBLIC_INTERFACE
 * The main container for GoalSaver.
 */
function App() {
  const [goals, setGoals] = useState([]);

  // PUBLIC_INTERFACE
  function handleAddGoal(goal) {
    setGoals(gArr => [...gArr, goal]);
  }

  // PUBLIC_INTERFACE
  function handleDeposit(idx, amount) {
    setGoals(goals =>
      goals.map((g, i) =>
        i === idx && g.saved + amount <= g.targetAmount
          ? {
              ...g,
              saved: g.saved + amount,
              history: [...(g.history || []), amount],
            }
          : g
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleDelete(idx) {
    setGoals(goals => goals.filter((_, i) => i !== idx));
  }

  // PUBLIC_INTERFACE
  function handleHabit(idx) {
    setGoals(goals =>
      goals.map((g, i) =>
        i === idx
          ? {
              ...g,
              reminders: [
                ...(g.reminders || []),
                {
                  desc: 'Remember to contribute every week!',
                  date: new Date().toISOString(),
                }
              ],
            }
          : g
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleClearHabit(createdKey) {
    setGoals(goals =>
      goals.map(g =>
        g.created === createdKey ? { ...g, reminders: [] } : g
      )
    );
  }

  // PUBLIC_INTERFACE
  function handlePrioritize(idx, direction) {
    // Move goal up or down in the list
    setGoals(goals => {
      if (
        (direction === -1 && idx === 0) ||
        (direction === 1 && idx === goals.length - 1)
      ) return goals;
      const updated = [...goals];
      const targetIdx = idx + direction;
      [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
      return updated;
    });
  }

  return (
    <div className="app" style={{ background: '#fff', minHeight: '100vh' }}>
      <nav className="navbar" style={{ background: COLORS.primary }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo" style={{ color: '#fff', fontWeight: 700 }}>
            <span className="logo-symbol" style={{ color: COLORS.secondary, fontSize: 24 }}>🐷</span> GoalSaver
          </div>
          <span style={{ color: '#fff', fontWeight: 400, fontSize: 16 }}>A virtual piggy bank</span>
        </div>
      </nav>
      <main>
        <div className="container" style={{paddingTop: 100, paddingBottom: 32}}>
          <header className="gs-hero">
            <h1 className="gs-title" style={{ color: COLORS.primary }}>GoalSaver</h1>
            <div className="gs-description">
              Set, track, and achieve your personal savings goals the smart way. No real money required—just pure habit-building and motivation!
            </div>
          </header>
          <GoalForm onAddGoal={handleAddGoal} />
          <RemindersPanel goals={goals} onClearHabit={handleClearHabit} />
          <GoalList
            goals={goals}
            onDeposit={handleDeposit}
            onDelete={handleDelete}
            onHabit={handleHabit}
            onPrioritize={handlePrioritize}
          />
        </div>
      </main>
      <footer className="gs-footer">
        <div className="container" style={{ textAlign: "center", color: COLORS.accent, opacity: .8, padding: '12px 0', fontSize: 15 }}>
          GoalSaver &copy; {new Date().getFullYear()} &middot; Virtual savings for a brighter tomorrow!
        </div>
      </footer>
    </div>
  );
}

export default App;

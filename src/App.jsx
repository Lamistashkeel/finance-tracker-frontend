// import React, { useState, useEffect, useMemo } from 'react';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// import { DollarSign, TrendingUp, Calendar, AlertCircle, PlusCircle, Settings, FileText, BarChart3, Trash2, LogOut, User } from 'lucide-react';
// import { authAPI, expenseAPI, categoryAPI, incomeAPI } from './services/api';

// const FinanceApp = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [loading, setLoading] = useState(false);
  
//   const [income, setIncome] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [expenses, setExpenses] = useState([]);
  
//   const [newExpense, setNewExpense] = useState({
//     date: new Date().toISOString().split('T')[0],
//     description: '',
//     category: '',
//     amount: '',
//     account: 'Credit Card'
//   });

//   const [authMode, setAuthMode] = useState('login');
//   const [authForm, setAuthForm] = useState({
//     name: '',
//     email: '',
//     password: ''
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const savedUser = localStorage.getItem('user');
    
//     if (token && savedUser) {
//       setUser(JSON.parse(savedUser));
//       setIsAuthenticated(true);
//     }
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated) {
//       initializeData();
//     }
//   }, [isAuthenticated]);

//   const initializeData = async () => {
//     setLoading(true);
//     try {
//       const [expensesData, categoriesData, incomeData] = await Promise.all([
//         expenseAPI.getAll(),
//         categoryAPI.getAll(),
//         incomeAPI.getAll()
//       ]);
      
//       setExpenses(expensesData);
//       setCategories(categoriesData);
//       setIncome(incomeData);
      
//       if (categoriesData.length > 0) {
//         setNewExpense(prev => ({ ...prev, category: categoriesData[0].name }));
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//       alert('Failed to load data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAuth = async () => {
//     if (!authForm.email || !authForm.password) {
//       alert('Please fill in all fields');
//       return;
//     }

//     if (authMode === 'register' && !authForm.name) {
//       alert('Please enter your name');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       let response;
//       if (authMode === 'register') {
//         response = await authAPI.register(authForm);
//       } else {
//         response = await authAPI.login({
//           email: authForm.email,
//           password: authForm.password
//         });
//       }
      
//       setUser(response.user);
//       setIsAuthenticated(true);
//       setAuthForm({ name: '', email: '', password: '' });
//     } catch (error) {
//       console.error('Auth error:', error);
//       alert(error.response?.data?.message || 'Authentication failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     authAPI.logout();
//     setIsAuthenticated(false);
//     setUser(null);
//     setExpenses([]);
//     setCategories([]);
//     setIncome([]);
//   };

//   const totalIncome = useMemo(() => 
//     income.reduce((sum, item) => sum + item.amount, 0), [income]
//   );

//   const totalBudget = useMemo(() => 
//     categories.reduce((sum, cat) => sum + cat.budget, 0), [categories]
//   );

//   const currentMonthExpenses = useMemo(() => {
//     const now = new Date();
//     return expenses.filter(exp => {
//       const expDate = new Date(exp.date);
//       return expDate.getMonth() === now.getMonth() && 
//              expDate.getFullYear() === now.getFullYear();
//     });
//   }, [expenses]);

//   const totalSpent = useMemo(() => 
//     currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0), 
//     [currentMonthExpenses]
//   );

//   const categorySpending = useMemo(() => {
//     const spending = {};
//     categories.forEach(cat => {
//       spending[cat.name] = currentMonthExpenses
//         .filter(exp => exp.category === cat.name)
//         .reduce((sum, exp) => sum + exp.amount, 0);
//     });
//     return spending;
//   }, [currentMonthExpenses, categories]);

//   const varianceData = useMemo(() => 
//     categories.map(cat => ({
//       ...cat,
//       actual: categorySpending[cat.name] || 0,
//       remaining: cat.budget - (categorySpending[cat.name] || 0),
//       percentage: ((categorySpending[cat.name] || 0) / cat.budget) * 100
//     })), [categories, categorySpending]
//   );

//   const averageDailySpend = useMemo(() => {
//     const today = new Date();
//     const dayOfMonth = today.getDate();
//     return totalSpent / dayOfMonth;
//   }, [totalSpent]);

//   const savingsActual = categorySpending['Savings'] || 0;
//   const savingsGoal = categories.find(c => c.name === 'Savings')?.budget || 0;

//   const addExpense = async () => {
//     if (!newExpense.description || !newExpense.amount) {
//       alert('Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const expense = await expenseAPI.create({
//         ...newExpense,
//         amount: parseFloat(newExpense.amount)
//       });
      
//       setExpenses([...expenses, expense]);
//       setNewExpense({
//         date: new Date().toISOString().split('T')[0],
//         description: '',
//         category: categories[0]?.name || '',
//         amount: '',
//         account: 'Credit Card'
//       });
//     } catch (error) {
//       console.error('Error adding expense:', error);
//       alert('Failed to add expense');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteExpense = async (id) => {
//     setLoading(true);
//     try {
//       await expenseAPI.delete(id);
//       setExpenses(expenses.filter(exp => exp._id !== id && exp.id !== id));
//     } catch (error) {
//       console.error('Error deleting expense:', error);
//       alert('Failed to delete expense');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pieChartData = varianceData
//     .filter(cat => cat.actual > 0)
//     .map(cat => ({
//       name: cat.name,
//       value: cat.actual,
//       color: cat.color
//     }));

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
//           <div className="text-center mb-8">
//             <DollarSign className="w-16 h-16 text-blue-600 mx-auto mb-4" />
//             <h1 className="text-3xl font-bold text-gray-800">Finance Manager</h1>
//             <p className="text-gray-600 mt-2">Track your expenses and budget</p>
//           </div>

//           <div className="flex gap-2 mb-6">
//             <button
//               onClick={() => setAuthMode('login')}
//               className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
//                 authMode === 'login'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               Login
//             </button>
//             <button
//               onClick={() => setAuthMode('register')}
//               className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
//                 authMode === 'register'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               Register
//             </button>
//           </div>

//           <div className="space-y-4">
//             {authMode === 'register' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
//                 <input
//                   type="text"
//                   value={authForm.name}
//                   onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter your name"
//                 />
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={authForm.email}
//                 onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//               <input
//                 type="password"
//                 value={authForm.password}
//                 onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter your password"
//                 onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
//               />
//             </div>

//             <button
//               onClick={handleAuth}
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create Account'}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }




import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Calendar, AlertCircle, PlusCircle, Settings, FileText, BarChart3, Trash2, LogOut, User } from 'lucide-react';
import { authAPI, expenseAPI, categoryAPI, incomeAPI } from './services/api';
import LoginPage from './components/LoginPage';

const FinanceApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  const [income, setIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    account: 'Credit Card'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated]);

  const initializeData = async () => {
    setLoading(true);
    try {
      const [expensesData, categoriesData, incomeData] = await Promise.all([
        expenseAPI.getAll(),
        categoryAPI.getAll(),
        incomeAPI.getAll()
      ]);
      
      setExpenses(expensesData);
      setCategories(categoriesData);
      setIncome(incomeData);
      
      if (categoriesData.length > 0) {
        setNewExpense(prev => ({ ...prev, category: categoriesData[0].name }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
    setExpenses([]);
    setCategories([]);
    setIncome([]);
  };

  const totalIncome = useMemo(() => 
    income.reduce((sum, item) => sum + item.amount, 0), [income]
  );

  const totalBudget = useMemo(() => 
    categories.reduce((sum, cat) => sum + cat.budget, 0), [categories]
  );

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === now.getMonth() && 
             expDate.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  const totalSpent = useMemo(() => 
    currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0), 
    [currentMonthExpenses]
  );

  const categorySpending = useMemo(() => {
    const spending = {};
    categories.forEach(cat => {
      spending[cat.name] = currentMonthExpenses
        .filter(exp => exp.category === cat.name)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });
    return spending;
  }, [currentMonthExpenses, categories]);

  const varianceData = useMemo(() => 
    categories.map(cat => ({
      ...cat,
      actual: categorySpending[cat.name] || 0,
      remaining: cat.budget - (categorySpending[cat.name] || 0),
      percentage: ((categorySpending[cat.name] || 0) / cat.budget) * 100
    })), [categories, categorySpending]
  );

  const averageDailySpend = useMemo(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    return totalSpent / dayOfMonth;
  }, [totalSpent]);

  const savingsActual = categorySpending['Savings'] || 0;
  const savingsGoal = categories.find(c => c.name === 'Savings')?.budget || 0;

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const expense = await expenseAPI.create({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      });
      
      setExpenses([...expenses, expense]);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: categories[0]?.name || '',
        amount: '',
        account: 'Credit Card'
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    setLoading(true);
    try {
      await expenseAPI.delete(id);
      setExpenses(expenses.filter(exp => exp._id !== id && exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = varianceData
    .filter(cat => cat.actual > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.actual,
      color: cat.color
    }));

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }


//////





  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Personal Finance Manager</h1>
                <p className="text-sm text-gray-600">Track. Budget. Save.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'expenses', label: 'Daily Expenses', icon: FileText },
              { id: 'summary', label: 'Monthly Summary', icon: Calendar },
              { id: 'settings', label: 'Budget Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className={`text-2xl font-bold ${totalIncome - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(totalIncome - totalSpent).toFixed(2)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Daily Spend</p>
                    <p className="text-2xl font-bold text-purple-600">${averageDailySpend.toFixed(2)}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Spending Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Budget vs Actual</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={varianceData.slice(0, 6)}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#93c5fd" name="Budget" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Savings Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Goal: ${savingsGoal.toFixed(2)}</span>
                  <span>Saved: ${savingsActual.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                    style={{ width: `${Math.min((savingsActual / savingsGoal) * 100, 100)}%` }}
                  >
                    {((savingsActual / savingsGoal) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Add New Expense
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newExpense.account}
                  onChange={(e) => setNewExpense({...newExpense, account: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Cash</option>
                  <option>Credit Card</option>
                  <option>Debit</option>
                </select>
              </div>
              <button
                onClick={addExpense}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.slice().reverse().map(exp => (
                      <tr key={exp._id || exp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{exp.date?.split('T')[0] || exp.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{exp.description}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">${exp.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{exp.account}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteExpense(exp._id || exp.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Variance Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Planned</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Used</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {varianceData.map(cat => (
                    <tr key={cat._id || cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">${cat.budget.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">${cat.actual.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        cat.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${cat.remaining.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{cat.percentage.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-20 py-1 rounded-full text-xs font-medium ${
                          cat.remaining >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cat.remaining >= 0 ? 'On Track' : 'Over'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-6 py-4 text-gray-900">TOTAL</td>
                    <td className="px-6 py-4 text-right text-gray-900">${totalBudget.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-900">${totalSpent.toFixed(2)}</td>
                    <td className={`px-6 py-4 text-right ${
                      totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${(totalBudget - totalSpent).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {((totalSpent / totalBudget) * 100).toFixed(1)}%
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Income Sources</h3>
              <div className="space-y-3">
                {income.map(inc => (
                  <div key={inc._id || inc.id} className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-900">{inc.source}</span>
                    <span className="text-lg font-bold text-green-600">${inc.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Monthly Income</span>
                    <span className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Budget Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat._id || cat.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: cat.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">${cat.budget.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Monthly Budget</span>
                  <span className="text-xl font-bold text-blue-600">${totalBudget.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceApp;
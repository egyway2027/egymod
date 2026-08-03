import React from 'react';
import { Search, User, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function CustomerSearchHeader({ 
  searchQuery, 
  setSearchQuery, 
  selectedCustomer, 
  onSelectCustomer, 
  customersList 
}) {
  return (
    <div className="space-y-4">
      {/* شريط البحث واختيار العميل */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          🔍 البحث عن عميل أو رقم العقد:
        </label>
        <div className="relative">
          <Search className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="اكتب اسم العميل، رقم الهاتف، أو رقم العقد..."
            className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* قائمة اقتراحات البحث */}
        {searchQuery && !selectedCustomer && (
          <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {customersList
              .filter(c => c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.contractId.includes(searchQuery))
              .map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onSelectCustomer(customer);
                    setSearchQuery('');
                  }}
                  className="w-full text-right px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 border-b last:border-0 border-gray-100 dark:border-gray-800 flex justify-between items-center transition"
                >
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white block">{customer.name}</span>
                    <span className="text-xs text-gray-500">رقم العقد: {customer.contractId} | هاتف: {customer.phone}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">اختر</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* بطاقات المخص المالي للعميل المختار */}
      {selectedCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">إجمالي المستحق</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedCustomer.totalAmount.toLocaleString()} ج.م</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">إجمالي المدفوع</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedCustomer.paidAmount.toLocaleString()} ج.م</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">المتبقي عليه</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{selectedCustomer.remainingAmount.toLocaleString()} ج.م</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">أقساط متأخرة</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{selectedCustomer.overdueCount} أقساط</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

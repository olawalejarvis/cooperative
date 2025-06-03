import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { UserAggregate } from '../store/user';

interface DashboardSummaryProps {
  aggregate: UserAggregate | null;
  userAggLoading: boolean;
  userAggError: string | null | undefined;
  avgDeposit: number;
  totalDeposits: number;
  totalTxCount: number;
  totalWithdrawals: number;
  chartData: Array<{ month: string; Deposits: number; Withdrawals: number }>;
  isYearToDate?: boolean;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  aggregate,
  userAggLoading,
  userAggError,
  avgDeposit,
  totalDeposits,
  totalTxCount,
  totalWithdrawals,
  chartData,
  isYearToDate = false
}) => (
  <>
    {/* Dashboard Cards Row */}
    <div className="row g-3 mb-4 flex-wrap">
      {/* Account Balance */}
      <div className="col-12 col-sm-6 col-md-4 mb-2 mb-md-0">
        <div className="p-3 h-100 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)', borderRadius: 16, boxShadow: '0 2px 12px rgba(80,120,200,0.07)' }}>
          <div className="d-flex align-items-center mb-2">
            <div style={{ background: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, boxShadow: '0 2px 8px rgba(80,120,200,0.10)' }}>
              <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm.5-9.5a.5.5 0 0 0-1 0V6H6a.5.5 0 0 0 0 1h1.5v2H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V10H10a.5.5 0 0 0 0-1H8.5V7H10a.5.5 0 0 0 0-1H8.5V4.5Z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', color: '#555', fontWeight: 500 }}>Account Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#222', letterSpacing: '-1px' }}>{aggregate ? aggregate.formattedAggregate : (userAggLoading ? <Spinner animation="border" size="sm" /> : '--')}</div>
            </div>
          </div>
          {userAggError && <Alert variant="warning" className="mb-0 py-1 px-2" style={{ fontSize: '0.95rem' }}>{userAggError}</Alert>}
        </div>
      </div>
      {/* Avg Deposit */}
      <div className="col-12 col-sm-6 col-md-4 mb-2 mb-md-0">
        <div className="p-3 h-100 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(90deg, #fdf6e3 0%, #f7e9c6 100%)', borderRadius: 16, boxShadow: '0 2px 12px rgba(200,180,80,0.07)' }}>
          <div className="d-flex align-items-center mb-2">
            <div style={{ background: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, boxShadow: '0 2px 8px rgba(200,180,80,0.10)' }}>
              <svg width="24" height="24" fill="#f59e42" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm2-7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', color: '#a67c00', fontWeight: 500 }}>
                Avg Deposit {isYearToDate ? '(YTD)' : '(2mo)'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a67c00', letterSpacing: '-1px' }}>{avgDeposit ? avgDeposit.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) : '--'}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.95rem', color: '#bfa94a' }}>{totalDeposits} deposits {isYearToDate ? 'this year' : 'in last 2 months'}</div>
        </div>
      </div>
      {/* Total Transactions */}
      <div className="col-12 col-md-4">
        <div className="p-3 h-100 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(90deg, #eafcf4 0%, #cfeee3 100%)', borderRadius: 16, boxShadow: '0 2px 12px rgba(80,200,120,0.07)' }}>
          <div className="d-flex align-items-center mb-2">
            <div style={{ background: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, boxShadow: '0 2px 8px rgba(80,200,120,0.10)' }}>
              <svg width="24" height="24" fill="#10b981" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12Zm3-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', color: '#10b981', fontWeight: 500 }}>
                Total Transactions {isYearToDate ? '(YTD)' : '(2mo)'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', letterSpacing: '-1px' }}>{totalTxCount}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.95rem', color: '#10b981' }}>{totalWithdrawals} withdrawals {isYearToDate ? 'this year' : 'in last 2 months'}</div>
        </div>
      </div>
    </div>
    {/* Chart Row */}
    <div className="mb-4" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(80,120,200,0.04)', padding: 8, paddingTop: 16, paddingBottom: 16 }}>
      <h6 className="mb-3" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1rem' }}>Deposits & Withdrawals (last 2 months)</h6>
      <div style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => v.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} />
            <Legend />
            <Bar dataKey="Deposits" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Withdrawals" fill="#f59e42" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </>
);

export default DashboardSummary;

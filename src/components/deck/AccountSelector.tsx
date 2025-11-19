/**
 * Account Selector Component
 *
 * Dropdown for selecting which account to use for a column
 */

import React from 'react';
import { useAccounts } from '../../contexts/AccountsContext';
import type { Account } from '../../types/auth';

interface AccountSelectorProps {
  /** Currently selected account DID */
  selectedDid: string;
  /** Callback when account selection changes */
  onAccountChange: (did: string) => void;
  /** Optional CSS classes */
  className?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  selectedDid,
  onAccountChange,
  className = '',
}) => {
  const { accounts } = useAccounts();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onAccountChange(event.target.value);
  };

  return (
    <select
      value={selectedDid}
      onChange={handleChange}
      className={`px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
      aria-label="アカウントを選択"
    >
      {accounts.map((account: Account) => (
        <option key={account.id} value={account.did}>
          @{account.handle}
          {account.displayName ? ` (${account.displayName})` : ''}
        </option>
      ))}
    </select>
  );
};

export default AccountSelector;

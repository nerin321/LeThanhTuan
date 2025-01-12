# Code Optimization: Identifying Issues and Improvements

This document provides an analysis of the original code, pointing out the computational inefficiencies and anti-patterns, along with recommended improvements for better performance and maintainability.

## Issues Identified

### 1. Redundant Filtering and Sorting in `useMemo`

- **Problem**: Both the filtering and sorting operations are performed together in the `useMemo` hook. This causes both operations to run every time `balances` changes, even if only one operation needs to be updated.
- **Impact**: This can result in unnecessary computations, especially when dealing with large data sets, leading to performance degradation.

### 2. Using `toFixed()` for Number Formatting

- **Problem**: The `toFixed()` method is used to format numbers, which can lead to precision loss or incorrect rounding, especially when dealing with floating-point numbers.
- **Impact**: This approach may result in inaccurate or imprecise display of numbers, affecting the user experience.

### 3. Mapping Data Multiple Times

- **Problem**: The code calls `map()` twice: once for creating `formattedBalances` and another time for generating `rows`. This results in multiple iterations over the `sortedBalances` array.
- **Impact**: This redundancy increases computational overhead and reduces performance, particularly with large datasets.

### 4. Using `index` as `key` in Lists

- **Problem**: Using `index` as the `key` for list items can cause performance issues in React. When the list changes (e.g., items are added, removed, or reordered), React may not optimize re-renders effectively.
- **Impact**: This can lead to unnecessary re-renders or poor performance when updating the UI.

### 5. Incorrect `useMemo` Dependencies

- **Problem**: The `useMemo` hook depends on both `balances` and `prices`. However, `prices` does not affect the sorting or filtering of balances, and changes to `prices` should not trigger a recomputation of sorting/filtering.
- **Impact**: This results in unnecessary recomputation of the memoized value when `prices` changes, causing inefficiency.

## Recommended Improvements

### 1. Separate Filtering and Sorting

- **Solution**: Separate the filtering and sorting logic to ensure that only the necessary operation is recalculated when data changes.
- **Benefit**: This minimizes the computational work required when only one operation (e.g., sorting or filtering) needs to be updated.

### 2. Use `toLocaleString()` for Number Formatting

- **Solution**: Replace `toFixed()` with `toLocaleString()`, which provides more control over formatting numbers and handles precision more effectively.
- **Benefit**: This improves the accuracy of number formatting and supports different locales and number precision requirements.

### 3. Map Data Only Once

- **Solution**: Map over the `sortedBalances` array only once to format balances and create rows in a single pass.
- **Benefit**: This eliminates redundant iterations and improves performance by reducing the number of times the data needs to be processed.

### 4. Use a Unique Key for List Items

- **Solution**: Instead of using `index`, use a unique key, such as a combination of `currency` and `blockchain`, for each list item.
- **Benefit**: This improves React's ability to optimize list rendering and prevents unnecessary re-renders, especially when the list changes dynamically.

### 5. Optimize `useMemo` Dependencies

- **Solution**: Adjust the `useMemo` hook to depend only on `balances`, as `prices` does not affect the sorting/filtering of balances.
- **Benefit**: This ensures that recomputation only occurs when necessary, preventing unnecessary recalculations when `prices` changes.

## Refactored Code Example

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Separate the priority logic
  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  // Filter and sort balances separately
  const sortedBalances = useMemo(() => {
    const validBalances = balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      return balancePriority > -99 && balance.amount > 0;
    });

    return validBalances.sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      return rightPriority - leftPriority; // To avoid complex comparisons
    });
  }, [balances]);

  // Format balances once
  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => ({
      ...balance,
      formatted: balance.amount.toLocaleString(), // Format numbers properly
    }));
  }, [sortedBalances]);

  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency + balance.blockchain} // Use unique key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
```

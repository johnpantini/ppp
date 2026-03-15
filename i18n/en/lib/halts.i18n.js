export default function (i18n) {
  i18n.extend({
    $halts: {
      US: {
        sc: {
          // Tape C & O (UTP)
          H: 'Trading Halt',
          Q: 'Quotation Resumption',
          T: 'Trading Resumption',
          P: 'Volatility Trading Pause',
          // Tape A & B (CTA)
          2: 'Trading Halt',
          3: 'Resume',
          5: 'Price Indication',
          6: 'Trading Range Indication',
          7: 'Market Imbalance Buy',
          8: 'Market Imbalance Sell',
          9: 'Market On Close Imbalance Buy',
          A: 'Market On Close Imbalance Sell',
          C: 'No Market Imbalance',
          D: 'No Market On Close Imbalance',
          E: 'Short Sale Restriction',
          F: 'LULD'
        },
        rc: {
          // Tape C & O (UTP)
          T1: 'News Pending⚡️',
          T2: 'Halt News Dissemination',
          T5: 'Single Stock Trading Pause In Effect',
          T6: 'Regulatory Halt Extraordinary Market Activity',
          T8: 'Halt ETF',
          T12: 'Information Requested By NASDAQ',
          H4: 'Halt Non Compliance',
          H9: 'Halt Filings Not Current',
          H10: 'Halt SEC Trading Suspension',
          H11: 'Halt Regulatory Concern',
          O1: 'Operations Halt, Contact Market Operations',
          IPO1: 'IPO Issue Not Yet Trading',
          M1: 'Corporate Action',
          M2: 'Quotation Not Available',
          LUDP: 'Volatility Trading Pause 〽️',
          LUDS: 'Volatility Trading Pause – Straddle Condition',
          MWC1: 'Market Wide Circuit Breaker Halt – Level 1',
          MWC2: 'Market Wide Circuit Breaker Halt – Level 2',
          MWC3: 'Market Wide Circuit Breaker Halt – Level 3',
          MWC0: 'Market Wide Circuit Breaker Halt – Carry Over From Previous Day',
          T3: 'News and Resumption Times',
          T7: 'Single Stock Trading Pause/Quotation-Only Period',
          R4: 'Qualifications Issues Reviewed/Resolved',
          R9: 'Filing Requirements Satisfied/Resolved',
          C3: 'Issuer News Not Forthcoming',
          C4: 'Qualifications Halt Ended',
          C9: 'Qualifications Halt Concluded',
          C11: 'Trade Halt Concluded By Other Regulatory Authority',
          R1: 'New Issue Available',
          R: 'Issue Available',
          IPOQ: 'IPO Security Released For Quotation',
          IPOE: 'IPO Security – Positioning Window Extension',
          MWCQ: 'Market Wide Circuit Breaker Resumption',
          // Tape A & B (CTA)
          D: 'News Released',
          I: 'Order Imbalance',
          M: 'LULD Trading Pause 〽️',
          P: 'News Pending⚡️',
          X: 'Operational',
          Y: 'Sub-Penny Trading',
          1: 'Market-Wide Circuit Breaker Level 1 – Breached',
          2: 'Market-Wide Circuit Breaker Level 2 – Breached',
          3: 'Market-Wide Circuit Breaker Level 3 – Breached'
        }
      }
    }
  });
}

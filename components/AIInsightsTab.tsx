// AI-powered medication insights and adherence analysis - Oct 12, 2025
// Displays Gemini-generated recommendations and safety alerts - Oct 19, 2025
// Insight cards and severity color coding designed with Cursor assistance - Oct 13, 2025
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Lightbulb, TriangleAlert as AlertTriangle, Info, TrendingUp } from 'lucide-react-native';
import * as Network from 'expo-network';
import { storageService, Insight } from '@/services/storage';
import { medicationService } from '@/services/medication';

interface AIInsightsTabProps {
  seniorId: string;
  largeText: boolean;
}

export function AIInsightsTab({ seniorId, largeText }: AIInsightsTabProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [adherence, setAdherence] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const textScale = largeText ? 1.2 : 1;

  useEffect(() => {
    loadInsights();
  }, [seniorId]);

  const loadInsights = async () => {
    const networkState = await Network.getNetworkStateAsync();
    const online = networkState.isConnected && networkState.isInternetReachable;
    setIsOnline(online);

    try {
      // Generate fresh insights
      await medicationService.generateInsights(seniorId);
      
      // Load insights and adherence
      const insightsData = await storageService.getInsights(seniorId);
      const adherenceData = await medicationService.calculateAdherence(seniorId, 7);
      
      setInsights(insightsData);
      setAdherence(adherenceData);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle size={20} color="#dc2626" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'info':
        return <Info size={20} color="#3b82f6" />;
      default:
        return <Lightbulb size={20} color="#6b7280" />;
    }
  };

  const getInsightStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#991b1b',
        };
      case 'warning':
        return {
          backgroundColor: '#fefbf2',
          borderColor: '#fed7aa',
          textColor: '#92400e',
        };
      case 'info':
        return {
          backgroundColor: '#f0f9ff',
          borderColor: '#bae6fd',
          textColor: '#1e40af',
        };
      default:
        return {
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb',
          textColor: '#374151',
        };
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return '#10b981';
    if (adherence >= 80) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontSize: 16 * textScale }]}>Generating insights...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Adherence Summary */}
      <View style={styles.adherenceCard}>
        <View style={styles.adherenceHeader}>
          <TrendingUp size={20} color={getAdherenceColor(adherence)} />
          <Text style={[styles.adherenceTitle, { fontSize: 16 * textScale }]}>
            7-Day Adherence
          </Text>
        </View>
        <View style={styles.adherenceContent}>
          <Text style={[
            styles.adherencePercent,
            { fontSize: 24 * textScale, color: getAdherenceColor(adherence) }
          ]}>
            {adherence.toFixed(0)}%
          </Text>
          <Text style={[styles.adherenceDescription, { fontSize: 14 * textScale }]}>
            {adherence >= 90 ? 'Excellent adherence' :
             adherence >= 80 ? 'Good adherence' :
             adherence >= 60 ? 'Fair adherence' : 'Poor adherence'}
          </Text>
        </View>
      </View>

      {!isOnline && (
        <View style={styles.offlineWarning}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={[styles.offlineWarningText, { fontSize: 14 * textScale }]}>
            Some insights may require an internet connection.
          </Text>
        </View>
      )}


      <ScrollView style={styles.insightsList}>
        {insights.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Lightbulb size={48} color="#9ca3af" />
            <Text style={[styles.emptyTitle, { fontSize: 18 * textScale }]}>No insights right now</Text>
            <Text style={[styles.emptyDescription, { fontSize: 16 * textScale }]}>
              Keep logging doses to get personalized insights and recommendations.
            </Text>
          </View>
        ) : (
          insights.map((insight) => {
            const style = getInsightStyle(insight.severity);
            
            return (
              <View
                key={insight.id}
                style={[
                  styles.insightCard,
                  { backgroundColor: style.backgroundColor, borderColor: style.borderColor }
                ]}
              >
                <View style={styles.insightHeader}>
                  {getInsightIcon(insight.severity)}
                  <Text style={[
                    styles.insightSeverity,
                    { fontSize: 12 * textScale, color: style.textColor }
                  ]}>
                    {insight.severity.toUpperCase()}
                  </Text>
                </View>
                
                <Text style={[
                  styles.insightMessage,
                  { fontSize: 16 * textScale, color: style.textColor }
                ]}>
                  {insight.message}
                </Text>
                
                {insight.suggestedAction && (
                  <View style={styles.insightAction}>
                    <Text style={[
                      styles.actionLabel,
                      { fontSize: 12 * textScale, color: style.textColor }
                    ]}>
                      Suggested action:
                    </Text>
                    <Text style={[
                      styles.actionText,
                      { fontSize: 14 * textScale, color: style.textColor }
                    ]}>
                      {insight.suggestedAction}
                    </Text>
                  </View>
                )}
                
                <Text style={[styles.insightDate, { fontSize: 12 * textScale }]}>
                  {new Date(insight.createdAtISO).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  adherenceCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  adherenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  adherenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  adherenceContent: {
    alignItems: 'center',
    gap: 4,
  },
  adherencePercent: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  adherenceDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  offlineWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
  },
  insightsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 8,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightSeverity: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  insightMessage: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  insightAction: {
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  insightDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
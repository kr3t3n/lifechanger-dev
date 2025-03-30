import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { useLifeChangesStore } from '@/store/useLifeChangesStore';
import { useGarminData } from '@/hooks/useGarminData';
import { GarminAuthPrompt } from '@/components/GarminAuthPrompt';

interface DailyData {
  date: string;
  high: number;
  low: number;
}

export default function BodyBatteryScreen() {
  const { width } = useWindowDimensions();
  const { isLoading, error, isAuthenticated } = useGarminData();
  const chartWidth = width - 32;
  const chartHeight = 220;
  const paddingTop = 20;
  const paddingBottom = 40;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const latestChange = useLifeChangesStore(state => state.getLatestChange());
  const data = useLifeChangesStore(state => state.bodyBatteryData);

  const changeIndex = latestChange 
    ? data.findIndex(d => new Date(d.date).toDateString() === new Date(latestChange.date).toDateString())
    : -1;

  const calculatePreChangeAverages = () => {
    if (changeIndex < 0 || !data.length) return null;
    
    const startIndex = Math.max(0, changeIndex - 7);
    const preChangeDays = data.slice(startIndex, changeIndex);
    
    if (preChangeDays.length === 0) return null;

    return {
      high: Math.round(preChangeDays.reduce((sum, day) => sum + day.high, 0) / preChangeDays.length),
      low: Math.round(preChangeDays.reduce((sum, day) => sum + day.low, 0) / preChangeDays.length)
    };
  };

  const preChangeAverages = calculatePreChangeAverages();

  const getY = (value: number) => {
    return paddingTop + graphHeight - (value / 100) * graphHeight;
  };

  const getX = (index: number) => {
    return (index * (chartWidth - 40)) / (data.length - 1) + 20;
  };

  const calculateImpact = () => {
    if (!preChangeAverages || !data.length) return null;
    
    const latestDay = data[data.length - 1];
    const highDiff = ((latestDay.high - preChangeAverages.high) / preChangeAverages.high) * 100;
    const lowDiff = ((latestDay.low - preChangeAverages.low) / preChangeAverages.low) * 100;
    
    return {
      high: Math.round(highDiff),
      low: Math.round(lowDiff)
    };
  };

  const impact = calculateImpact();

  const formatDateRange = () => {
    if (!data.length) return '';
    const firstDate = new Date(data[0].date);
    const lastDate = new Date(data[data.length - 1].date);
    return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (!isAuthenticated) {
    return <GarminAuthPrompt />;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Loading body battery data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Error loading data</Text>
          <Text style={styles.noDataSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No body battery data available</Text>
          <Text style={styles.noDataSubtext}>Connect your Garmin device to see your data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity>
            <ChevronLeft color="#0099FF" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Body Battery</Text>
          <TouchableOpacity>
            <Text style={styles.helpText}>Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          <TouchableOpacity style={styles.periodOption}>
            <Text style={styles.periodText}>1d</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.periodOption}>
            <Text style={styles.periodText}>7d</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.periodOption, styles.periodOptionSelected]}>
            <Text style={[styles.periodText, styles.periodTextSelected]}>4w</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.navigationContainer}>
            <TouchableOpacity style={styles.navButton}>
              <ChevronLeft color="#666" size={24} />
            </TouchableOpacity>
            <Text style={styles.dateRange}>{formatDateRange()}</Text>
            <TouchableOpacity style={styles.navButton}>
              <ChevronRight color="#666" size={24} />
            </TouchableOpacity>
          </View>

          <Text style={styles.chartTitle}>Daily Values</Text>

          <View style={styles.chartWrapper}>
            <View style={styles.yAxis}>
              {[100, 75, 50, 25, 0].map((value) => (
                <Text key={value} style={styles.axisLabel}>
                  {value}
                </Text>
              ))}
            </View>

            <Svg width={chartWidth} height={chartHeight}>
              {[100, 75, 50, 25, 0].map((value) => (
                <Line
                  key={value}
                  x1="20"
                  y1={getY(value)}
                  x2={chartWidth - 20}
                  y2={getY(value)}
                  stroke="#222"
                  strokeWidth="1"
                />
              ))}

              {preChangeAverages && changeIndex >= 0 && (
                <>
                  <Line
                    x1={getX(changeIndex)}
                    y1={getY(preChangeAverages.high)}
                    x2={chartWidth - 20}
                    y2={getY(preChangeAverages.high)}
                    stroke="#0099FF"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />
                  <Line
                    x1={getX(changeIndex)}
                    y1={getY(preChangeAverages.low)}
                    x2={chartWidth - 20}
                    y2={getY(preChangeAverages.low)}
                    stroke="#FFF"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />
                </>
              )}

              {changeIndex >= 0 && (
                <Line
                  x1={getX(changeIndex)}
                  y1={0}
                  x2={getX(changeIndex)}
                  y2={chartHeight}
                  stroke="#1A1A1A"
                  strokeWidth="2"
                />
              )}

              {data.map((d, i) => (
                <Line
                  key={i}
                  x1={getX(i)}
                  y1={getY(d.low)}
                  x2={getX(i)}
                  y2={getY(d.high)}
                  stroke={i === changeIndex ? '#0099FF' : '#2A2A2A'}
                  strokeWidth="8"
                />
              ))}

              {data.map((d, i) => (
                <Circle
                  key={`high-dot-${i}`}
                  cx={getX(i)}
                  cy={getY(d.high)}
                  r="3"
                  fill="#0099FF"
                />
              ))}

              {data.map((d, i) => (
                <Circle
                  key={`low-dot-${i}`}
                  cx={getX(i)}
                  cy={getY(d.low)}
                  r="3"
                  fill="#FFF"
                />
              ))}
            </Svg>

            <View style={styles.xAxis}>
              <Text style={styles.axisLabel}>
                {data[0] && new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.axisLabel}>
                {data[data.length - 1] && new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.blueDot]} />
              <Text style={styles.legendText}>Daily High</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.whiteDot]} />
              <Text style={styles.legendText}>Daily Low</Text>
            </View>
            {preChangeAverages && (
              <View style={styles.legendItem}>
                <View style={styles.legendBar} />
                <Text style={styles.legendText}>Pre-change Average</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {impact && latestChange && (
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>
                Impact of {latestChange.type === 'stop' ? 'stopping' : 'starting'} {latestChange.name}
              </Text>
              <View style={styles.impactStats}>
                <View style={styles.impactStat}>
                  <Text style={styles.impactLabel}>High Average</Text>
                  <Text style={[
                    styles.impactValue,
                    impact.high > 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    {impact.high > 0 ? '+' : ''}{impact.high}%
                  </Text>
                </View>
                <View style={styles.impactStat}>
                  <Text style={styles.impactLabel}>Low Average</Text>
                  <Text style={[
                    styles.impactValue,
                    impact.low > 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    {impact.low > 0 ? '+' : ''}{impact.low}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {data.length > 0 && (
          <View style={styles.dayDetailsContainer}>
            <View style={styles.dayCard}>
              <Text style={styles.dayTitle}>
                {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
              <Text style={styles.dayDate}>
                {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.batteryValue}>{data[data.length - 1].high}</Text>
              <Text style={styles.batteryLabel}>High</Text>
              <Text style={styles.batteryValue}>{data[data.length - 1].low}</Text>
              <Text style={styles.batteryLabel}>Low</Text>
            </View>

            {data.length > 1 && (
              <View style={styles.dayCard}>
                <Text style={styles.dayTitle}>
                  {new Date(data[data.length - 2].date).toLocaleDateString('en-US', { weekday: 'long' })}
                </Text>
                <Text style={styles.dayDate}>
                  {new Date(data[data.length - 2].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </Text>
                <Text style={styles.batteryValue}>{data[data.length - 2].high}</Text>
                <Text style={styles.batteryLabel}>High</Text>
                <Text style={styles.batteryValue}>{data[data.length - 2].low}</Text>
                <Text style={styles.batteryLabel}>Low</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noDataSubtext: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  helpText: {
    color: '#0099FF',
    fontSize: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  periodOptionSelected: {
    backgroundColor: '#333',
    borderRadius: 6,
  },
  periodText: {
    color: '#666',
    fontSize: 16,
  },
  periodTextSelected: {
    color: '#FFF',
  },
  chartContainer: {
    padding: 16,
    backgroundColor: '#000',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  dateRange: {
    color: '#FFF',
    fontSize: 16,
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  yAxis: {
    width: 40,
    height: 220,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
  },
  axisLabel: {
    color: '#666',
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendBar: {
    width: 16,
    height: 2,
    backgroundColor: '#0099FF',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#0099FF',
  },
  blueDot: {
    backgroundColor: '#0099FF',
  },
  whiteDot: {
    backgroundColor: '#FFF',
  },
  legendText: {
    color: '#FFF',
    fontSize: 14,
  },
  insightsContainer: {
    padding: 16,
    backgroundColor: '#000',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  insightTitle: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactStat: {
    flex: 1,
  },
  impactLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  positiveChange: {
    color: '#00D1FF',
  },
  negativeChange: {
    color: '#FF3B30',
  },
  dayDetailsContainer: {
    padding: 16,
    gap: 8,
  },
  dayCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
  },
  dayTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayDate: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  batteryValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  batteryLabel: {
    color: '#666',
    fontSize: 14,
  },
});
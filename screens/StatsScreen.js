import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { CATEGORY_GROUPS, CATEGORY_COLORS, CATEGORY_ICONS, GROUP_COLORS, CATEGORY_GROUP_MAP } from '../constants';
import { LEAGUE_ICONS, LEAGUE_KEYS } from '../leagueStadiums';
import { matchesFilter, formatDisplayDate, parseDateStr } from '../utils/dates';
import { FilterBar } from '../components/FilterBar';
import { MilestonesSection } from '../components/MilestonesSection';
import { useTheme } from '../context/ThemeContext';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatsSectionHeader({ title }) {
  const { styles } = useTheme();
  return <Text style={styles.statsSectionHeader}>{title}</Text>;
}

function MetricCard({ label, value, icon }) {
  const { styles } = useTheme();
  return (
    <View style={styles.statsMetricCard}>
      <Text style={styles.statsMetricIcon}>{icon}</Text>
      <Text style={styles.statsMetricValue}>{value}</Text>
      <Text style={styles.statsMetricLabel}>{label}</Text>
    </View>
  );
}

export function StatsScreen({ events, bucketList = [], onToggleBucketList }) {
  const { styles, colors } = useTheme();
  const [filter, setFilter] = useState('all');

  const bucketByLeague = useMemo(() => {
    return LEAGUE_KEYS
      .map((league) => ({
        league,
        items: bucketList.filter((b) => b.league === league).sort((a, b) => a.team.localeCompare(b.team)),
      }))
      .filter((g) => g.items.length > 0);
  }, [bucketList]);

  const filtered = useMemo(
    () => events.filter((e) => matchesFilter(e, filter)),
    [events, filter]
  );

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;

    const totalEvents   = filtered.length;
    const uniqueVenues  = new Set(filtered.map((e) => e.venue)).size;
    const citiesVisited = new Set(
      filtered.filter((e) => e.location && e.location !== '—').map((e) => e.location)
    ).size;

    const validDated = filtered.filter((e) => e.date && e.date !== '—');

    // Year breakdown
    const yearMap = {};
    validDated.forEach((e) => {
      const y = parseDateStr(e.date).getFullYear();
      if (!isNaN(y)) yearMap[y] = (yearMap[y] || 0) + 1;
    });
    const timeline     = Object.entries(yearMap).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: +year, count }));
    const yearsActive  = new Set(Object.keys(yearMap).map(Number)).size;
    const maxYearCount = Math.max(...timeline.map((t) => t.count), 1);

    // First / most recent event
    const sortedByDate = [...validDated].sort((a, b) => parseDateStr(a.date) - parseDateStr(b.date));
    const firstEvent   = sortedByDate[0] ?? null;
    const latestEvent  = sortedByDate[sortedByDate.length - 1] ?? null;
    const avgPerYear   = yearsActive > 1 ? (totalEvents / yearsActive).toFixed(1) : null;

    // Monthly breakdown
    const monthMap = {};
    validDated.forEach((e) => {
      const d = parseDateStr(e.date);
      if (!isNaN(d.getTime())) { const m = d.getMonth(); monthMap[m] = (monthMap[m] || 0) + 1; }
    });
    const monthlyBreakdown = MONTH_NAMES.map((name, i) => ({ name, count: monthMap[i] || 0 }));
    const maxMonthCount    = Math.max(...monthlyBreakdown.map((m) => m.count), 1);
    const hasMonthData     = monthlyBreakdown.some((m) => m.count > 0);

    // Category groups
    const groupCounts = { stadium: 0, outdoor: 0, entertainment: 0 };
    filtered.forEach((e) => {
      const g = CATEGORY_GROUP_MAP[e.category];
      if (g) groupCounts[g] = (groupCounts[g] || 0) + 1;
    });
    const groupTotal = Object.values(groupCounts).reduce((s, n) => s + n, 0);

    // Per-category
    const catMap = {};
    filtered.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + 1; });
    const categoriesSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const maxCatCount      = categoriesSorted.length > 0 ? categoriesSorted[0][1] : 1;

    // Top venues
    const venueMap = {};
    filtered.forEach((e) => {
      if (!venueMap[e.venue]) venueMap[e.venue] = { name: e.venue, city: e.location !== '—' ? e.location : '', count: 0 };
      venueMap[e.venue].count++;
    });
    const topVenues = Object.values(venueMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Top cities
    const cityMap = {};
    filtered.filter((e) => e.location && e.location !== '—').forEach((e) => {
      cityMap[e.location] = (cityMap[e.location] || 0) + 1;
    });
    const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, count]) => ({ city, count }));

    return {
      totalEvents, uniqueVenues, citiesVisited, yearsActive,
      firstEvent, latestEvent, avgPerYear,
      groupCounts, groupTotal,
      categoriesSorted, maxCatCount,
      topVenues, topCities,
      timeline, maxYearCount,
      monthlyBreakdown, maxMonthCount, hasMonthData,
    };
  }, [filtered]);

  return (
    <View style={{ flex: 1 }}>
      <FilterBar value={filter} onChange={setFilter} />

      <ScrollView style={styles.statsScroll} contentContainerStyle={styles.statsContent} showsVerticalScrollIndicator={false}>

        {events.length === 0 ? (
          <View style={styles.statsEmpty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No stats yet</Text>
            <Text style={styles.emptySubtext}>Add events to see your breakdown</Text>
          </View>
        ) : !stats ? (
          <View style={styles.statsEmpty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No events in this period</Text>
            <Text style={styles.emptySubtext}>Try a different time range</Text>
          </View>
        ) : (
          <>
          {/* ─ OVERVIEW ─ */}
          <StatsSectionHeader title="OVERVIEW" />
          <View style={styles.statsGrid}>
            <MetricCard label="Total Events"   value={stats.totalEvents}   icon="🎟" />
            <MetricCard label="Unique Venues"  value={stats.uniqueVenues}  icon="🏟" />
            <MetricCard label="Cities Visited" value={stats.citiesVisited} icon="🏙" />
            <MetricCard label="Years Active"   value={stats.yearsActive}   icon="📅" />
          </View>

          {/* ─ HIGHLIGHTS ─ */}
          {(stats.firstEvent || stats.avgPerYear) && (
            <>
              <StatsSectionHeader title="HIGHLIGHTS" />
              <View style={styles.statsCard}>
                {stats.firstEvent && (
                  <View style={styles.statsHighlightRow}>
                    <Text style={styles.statsHighlightIcon}>🎉</Text>
                    <View style={styles.statsHighlightBody}>
                      <Text style={styles.statsHighlightLabel}>First Event</Text>
                      <Text style={styles.statsHighlightValue} numberOfLines={1}>{stats.firstEvent.name}</Text>
                      <Text style={styles.statsHighlightSub}>{formatDisplayDate(stats.firstEvent.date)} · {stats.firstEvent.venue}</Text>
                    </View>
                  </View>
                )}
                {stats.firstEvent && stats.latestEvent && stats.firstEvent.id !== stats.latestEvent.id && (
                  <>
                    <View style={styles.statsDivider} />
                    <View style={styles.statsHighlightRow}>
                      <Text style={styles.statsHighlightIcon}>🏁</Text>
                      <View style={styles.statsHighlightBody}>
                        <Text style={styles.statsHighlightLabel}>Most Recent</Text>
                        <Text style={styles.statsHighlightValue} numberOfLines={1}>{stats.latestEvent.name}</Text>
                        <Text style={styles.statsHighlightSub}>{formatDisplayDate(stats.latestEvent.date)} · {stats.latestEvent.venue}</Text>
                      </View>
                    </View>
                  </>
                )}
                {stats.avgPerYear && (
                  <>
                    <View style={styles.statsDivider} />
                    <View style={styles.statsHighlightRow}>
                      <Text style={styles.statsHighlightIcon}>📈</Text>
                      <View style={styles.statsHighlightBody}>
                        <Text style={styles.statsHighlightLabel}>Avg Events / Year</Text>
                        <Text style={styles.statsHighlightValue}>{stats.avgPerYear}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </>
          )}

          {/* ─ BY CATEGORY GROUP ─ */}
          {(() => {
            const groupSegments = CATEGORY_GROUPS
              .map((g) => ({ ...g, count: stats.groupCounts[g.key] || 0 }))
              .filter((g) => g.count > 0);
            if (groupSegments.length === 0) return null;
            return (
              <>
                <StatsSectionHeader title="BY CATEGORY GROUP" />
                <View style={styles.statsCard}>
                  <View style={styles.statsGroupBar}>
                    {groupSegments.map((g, i) => (
                      <View
                        key={g.key}
                        style={[
                          styles.statsGroupBarSegment,
                          { flex: g.count, backgroundColor: GROUP_COLORS[g.key] },
                          i === 0                        && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
                          i === groupSegments.length - 1 && { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
                        ]}
                      />
                    ))}
                  </View>
                  {groupSegments.map((g) => {
                    const pct = stats.groupTotal > 0 ? Math.round((g.count / stats.groupTotal) * 100) : 0;
                    return (
                      <View key={g.key} style={styles.statsGroupLegendRow}>
                        <View style={[styles.statsGroupDot, { backgroundColor: GROUP_COLORS[g.key] }]} />
                        <Text style={styles.statsGroupLegendLabel}>{g.label}</Text>
                        <Text style={styles.statsGroupLegendCount}>{g.count}</Text>
                        <Text style={styles.statsGroupLegendPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            );
          })()}

          {/* ─ BY SPORT / CATEGORY ─ */}
          <StatsSectionHeader title="BY SPORT / CATEGORY" />
          <View style={styles.statsCard}>
            {stats.categoriesSorted.map(([cat, count], i) => {
              const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other;
              const barPct = stats.maxCatCount > 0 ? count / stats.maxCatCount : 0;
              return (
                <View key={cat}>
                  {i > 0 && <View style={styles.statsDivider} />}
                  <View style={styles.statsCatRow}>
                    <Text style={styles.statsCatRank}>#{i + 1}</Text>
                    <Text style={styles.statsCatIcon}>{CATEGORY_ICONS[cat] ?? '📌'}</Text>
                    <View style={{ flex: 1, gap: 5 }}>
                      <Text style={styles.statsCatName}>{cat}</Text>
                      <View style={styles.statsCatBarWrap}>
                        <View style={[styles.statsCatBar, { width: `${Math.round(barPct * 100)}%`, backgroundColor: colors.text }]} />
                      </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.bg, marginLeft: 8 }]}>
                      <Text style={[styles.badgeText, { color: colors.text }]}>{count}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ─ MONTHLY ACTIVITY ─ */}
          {stats.hasMonthData && (
            <>
              <StatsSectionHeader title="MONTHLY ACTIVITY" />
              <View style={styles.statsCard}>
                <View style={styles.statsMonthGrid}>
                  {stats.monthlyBreakdown.map(({ name, count }) => {
                    const intensity = stats.maxMonthCount > 0 ? count / stats.maxMonthCount : 0;
                    return (
                      <View key={name} style={styles.statsMonthCell}>
                        <View style={styles.statsMonthBarWrap}>
                          <View
                            style={[
                              styles.statsMonthBar,
                              {
                                height: count > 0 ? Math.max(4, Math.round(intensity * 40)) : 0,
                                backgroundColor: `rgba(${colors.accentRgb},${(0.25 + intensity * 0.75).toFixed(2)})`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statsMonthLabel}>{name}</Text>
                        {count > 0 && <Text style={styles.statsMonthCount}>{count}</Text>}
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* ─ TOP VENUES ─ */}
          <StatsSectionHeader title="TOP VENUES" />
          <View style={styles.statsCard}>
            {stats.topVenues.map((v, i) => (
              <View key={v.name}>
                {i > 0 && <View style={styles.statsDivider} />}
                <View style={styles.statsRankRow}>
                  <Text style={styles.statsRankNum}>{i + 1}</Text>
                  <View style={styles.statsRankBody}>
                    <Text style={styles.statsRankName}>{v.name}</Text>
                    {v.city ? <Text style={styles.statsRankSub}>{v.city}</Text> : null}
                  </View>
                  <View style={styles.statsCountPill}>
                    <Text style={styles.statsCountPillText}>{v.count}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* ─ TOP CITIES ─ */}
          <StatsSectionHeader title="TOP CITIES" />
          <View style={styles.statsCard}>
            {stats.topCities.length === 0 ? (
              <Text style={styles.statsEmptyInCard}>No city data — add a city when logging events</Text>
            ) : (
              stats.topCities.map(({ city, count }, i) => (
                <View key={city}>
                  {i > 0 && <View style={styles.statsDivider} />}
                  <View style={styles.statsRankRow}>
                    <Text style={styles.statsRankNum}>{i + 1}</Text>
                    <Text style={[styles.statsRankName, { flex: 1 }]}>{city}</Text>
                    <View style={styles.statsCountPill}>
                      <Text style={styles.statsCountPillText}>{count}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ─ YEAR BY YEAR ─ */}
          <StatsSectionHeader title="YEAR BY YEAR" />
          <View style={styles.statsCard}>
            {stats.timeline.length === 0 ? (
              <Text style={styles.statsEmptyInCard}>No date data — add a date when logging events</Text>
            ) : (
              stats.timeline.map(({ year, count }, i) => (
                <View key={year}>
                  {i > 0 && <View style={styles.statsDivider} />}
                  <View style={styles.statsTimelineRow}>
                    <Text style={styles.statsTimelineYear}>{year}</Text>
                    <View style={styles.statsTimelineBarWrap}>
                      <View style={[styles.statsTimelineBar, { width: `${Math.round((count / stats.maxYearCount) * 100)}%` }]} />
                    </View>
                    <Text style={styles.statsTimelineCount}>{count}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
          </>
        )}

        {/* ─ BUCKET LIST ─ */}
        <StatsSectionHeader title="BUCKET LIST" />
        {bucketByLeague.length === 0 ? (
          <View style={styles.statsCard}>
            <Text style={styles.statsEmptyInCard}>No stadiums yet — add one from a league's TO VISIT list</Text>
          </View>
        ) : (
          bucketByLeague.map((group) => (
            <View key={group.league} style={{ marginBottom: 4 }}>
              <Text style={styles.badgeGroupLabel}>{LEAGUE_ICONS[group.league]} {group.league}</Text>
              <View style={styles.statsCard}>
                {group.items.map((b, i) => (
                  <View key={b.team}>
                    {i > 0 && <View style={styles.statsDivider} />}
                    <View style={styles.statsRankRow}>
                      <View style={styles.statsRankBody}>
                        <Text style={styles.statsRankName}>{b.stadium}</Text>
                        <Text style={styles.statsRankSub}>{b.team} · {b.city}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => onToggleBucketList(b.league, b.team, b.stadium, b.city)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.bucketRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <MilestonesSection events={events} />

      </ScrollView>
    </View>
  );
}

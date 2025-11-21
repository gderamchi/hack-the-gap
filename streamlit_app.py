import streamlit as st
import asyncio
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
from orchestrator import InfluencerOrchestrator
from leaderboard import LeaderboardManager
import database

# Page config
st.set_page_config(
    page_title="French Influencer Monitor",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1f2937;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        text-align: center;
        color: #6b7280;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .drama-card {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .good-card {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .mention-card {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
        margin-bottom: 1rem;
    }
    .drama-mention {
        border-left-color: #ef4444;
    }
    .good-mention {
        border-left-color: #10b981;
    }
    .rank-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
        border-left: 5px solid #3b82f6;
        transition: transform 0.2s;
    }
    .rank-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    .rank-card-gold {
        border-left-color: #fbbf24;
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }
    .rank-card-silver {
        border-left-color: #9ca3af;
        background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
    }
    .rank-card-bronze {
        border-left-color: #cd7f32;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    }
    .achievement-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        margin: 0.2rem;
        font-weight: 500;
    }
    .stat-box {
        background: #f3f4f6;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        margin: 0.5rem 0;
    }
    .leaderboard-header {
        font-size: 2.5rem;
        font-weight: bold;
        text-align: center;
        color: #1f2937;
        margin: 2rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize orchestrator
@st.cache_resource
def get_orchestrator():
    return InfluencerOrchestrator()

@st.cache_resource
def get_leaderboard_manager():
    return LeaderboardManager()

orchestrator = get_orchestrator()
leaderboard_manager = get_leaderboard_manager()

# Initialize database
database.init_db()

# Header
st.markdown('<div class="main-header">🔍 French Influencer Monitor</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Analysez la réputation des influenceurs français</div>', unsafe_allow_html=True)

# Navigation
page = st.sidebar.radio(
    "Navigation",
    ["🔍 Analyse", "🏆 Leaderboard"],
    index=0
)

# Sidebar
with st.sidebar:
    st.header("⚙️ Options")
    
    # Contributor username input (for tracking)
    if page == "🔍 Analyse":
        st.markdown("### 👤 Contributeur")
        contributor_username = st.text_input(
            "Votre nom d'utilisateur",
            placeholder="Ex: JohnDoe",
            help="Entrez votre nom pour gagner des points!",
            key="contributor_username"
        )
    
    st.markdown("### À propos")
    st.info("""
    Cette application analyse la réputation des influenceurs français en:
    - 🌐 Scrapant les actualités, réseaux sociaux et forums
    - 🤖 Analysant le sentiment avec IA
    - 📊 Calculant un score de confiance (0-100)
    """)
    
    st.markdown("### Sources")
    st.markdown("""
    - 📰 Actualités françaises
    - 🎥 YouTube
    - 🐦 Twitter/X
    - 💬 Reddit
    - 🗨️ Forums français
    """)
    
    if page == "🔍 Analyse":
        use_cache = st.checkbox("Utiliser le cache", value=True, help="Utiliser les données en cache si disponibles")
    
    st.markdown("---")
    st.markdown("**Développé avec ❤️ pour le Hackathon**")

# Helper function for displaying mentions
def display_mentions(mentions, filter_type=None):
    """Display mentions with optional filtering"""
    if not mentions:
        st.info("Aucune mention trouvée")
        return
    
    for mention in mentions[:20]:  # Limit to 20 for performance
        label = mention['label']
        sentiment = mention['sentiment_score']
        
        # Determine card class
        card_class = "mention-card"
        if label == 'drama':
            card_class += " drama-mention"
            emoji = "⚠️"
        elif label == 'good_action':
            card_class += " good-mention"
            emoji = "✅"
        else:
            emoji = "ℹ️"
        
        # Format sentiment
        sentiment_text = f"{'Positif' if sentiment > 0 else 'Négatif'} ({sentiment:.2f})"
        
        st.markdown(f"""
        <div class="{card_class}">
            <p><strong>{emoji} {mention.get('title', 'Sans titre')}</strong></p>
            <p style="color: #6b7280; font-size: 0.9rem;">{mention['text'][:300]}...</p>
            <p style="font-size: 0.85rem; margin-top: 0.5rem;">
                <strong>Source:</strong> {mention['source']} | 
                <strong>Sentiment:</strong> {sentiment_text} | 
                <a href="{mention['url']}" target="_blank">🔗 Voir la source</a>
            </p>
        </div>
        """, unsafe_allow_html=True)

# Main content - Route based on page selection
if page == "🏆 Leaderboard":
    # Leaderboard page
    st.markdown('<div class="leaderboard-header">🏆 Leaderboard des Contributeurs</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Classement des meilleurs analystes d\'influenceurs</div>', unsafe_allow_html=True)
    
    # Time period tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📅 Aujourd'hui", "📆 Cette Semaine", "📊 Ce Mois", "🏆 Tout le Temps"])
    
    periods = [
        ('day', tab1),
        ('week', tab2),
        ('month', tab3),
        ('all', tab4)
    ]
    
    for period, tab in periods:
        with tab:
            # Get rankings for this period
            rankings = leaderboard_manager.get_rankings(period=period, limit=10)
            
            if not rankings:
                st.info("Aucun contributeur pour cette période")
                continue
            
            # Display top 3 with special styling
            if len(rankings) >= 1:
                st.markdown("### 🎖️ Top 3")
                top3_cols = st.columns(3)
                
                for idx, ranking in enumerate(rankings[:3]):
                    with top3_cols[idx]:
                        medal = leaderboard_manager.get_medal_emoji(idx + 1)
                        card_class = ""
                        if idx == 0:
                            card_class = "rank-card-gold"
                        elif idx == 1:
                            card_class = "rank-card-silver"
                        elif idx == 2:
                            card_class = "rank-card-bronze"
                        
                        st.markdown(f"""
                        <div class="rank-card {card_class}">
                            <h1 style="text-align: center; margin: 0;">{medal}</h1>
                            <h3 style="text-align: center; margin: 0.5rem 0;">{ranking['username']}</h3>
                            <div class="stat-box">
                                <h2 style="margin: 0; color: #667eea;">{ranking['points']}</h2>
                                <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Points</p>
                            </div>
                            <div style="display: flex; justify-content: space-around; margin-top: 1rem;">
                                <div>
                                    <p style="margin: 0; font-weight: bold; color: #1f2937;">{ranking['analyses_count']}</p>
                                    <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">Analyses</p>
                                </div>
                                <div>
                                    <p style="margin: 0; font-weight: bold; color: #1f2937;">{ranking['streak_days']}</p>
                                    <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">Jours de suite</p>
                                </div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        # Display achievements
                        achievements = ranking.get('achievements', [])
                        if achievements:
                            st.markdown("**Badges:**")
                            for achievement in achievements[:3]:  # Show top 3 achievements
                                st.markdown(f'<span class="achievement-badge">{achievement["name"]}</span>', unsafe_allow_html=True)
            
            # Display rest of top 10
            if len(rankings) > 3:
                st.markdown("### 📋 Top 4-10")
                
                for idx, ranking in enumerate(rankings[3:10], start=4):
                    col1, col2, col3, col4, col5 = st.columns([1, 3, 2, 2, 2])
                    
                    with col1:
                        st.markdown(f"**#{idx}**")
                    
                    with col2:
                        st.markdown(f"**{ranking['username']}**")
                    
                    with col3:
                        st.markdown(f"🏆 {ranking['points']} pts")
                    
                    with col4:
                        st.markdown(f"📊 {ranking['analyses_count']} analyses")
                    
                    with col5:
                        st.markdown(f"🔥 {ranking['streak_days']} jours")
                    
                    st.markdown("---")
            
            # Period statistics
            st.markdown("### 📈 Statistiques de la Période")
            stat_col1, stat_col2, stat_col3 = st.columns(3)
            
            total_points = sum(r['points'] for r in rankings)
            total_analyses = sum(r['analyses_count'] for r in rankings)
            avg_points = total_points / len(rankings) if rankings else 0
            
            with stat_col1:
                st.markdown(f"""
                <div class="stat-box">
                    <h3 style="margin: 0; color: #667eea;">{len(rankings)}</h3>
                    <p style="margin: 0; color: #6b7280;">Contributeurs Actifs</p>
                </div>
                """, unsafe_allow_html=True)
            
            with stat_col2:
                st.markdown(f"""
                <div class="stat-box">
                    <h3 style="margin: 0; color: #667eea;">{total_analyses}</h3>
                    <p style="margin: 0; color: #6b7280;">Analyses Totales</p>
                </div>
                """, unsafe_allow_html=True)
            
            with stat_col3:
                st.markdown(f"""
                <div class="stat-box">
                    <h3 style="margin: 0; color: #667eea;">{avg_points:.0f}</h3>
                    <p style="margin: 0; color: #6b7280;">Points Moyens</p>
                </div>
                """, unsafe_allow_html=True)
            
            # Ranking chart
            if rankings:
                st.markdown("### 📊 Graphique des Points")
                df_rankings = pd.DataFrame([{
                    'Contributeur': r['username'],
                    'Points': r['points']
                } for r in rankings[:10]])
                
                fig = px.bar(
                    df_rankings,
                    x='Contributeur',
                    y='Points',
                    color='Points',
                    color_continuous_scale='Blues',
                    title=f"Top 10 - {leaderboard_manager.get_period_label(period)}"
                )
                fig.update_layout(
                    showlegend=False,
                    height=400,
                    xaxis_tickangle=-45
                )
                st.plotly_chart(fig, use_container_width=True)
    
    # Achievement showcase
    st.markdown("---")
    st.markdown("### 🎖️ Badges Disponibles")
    st.markdown("Débloquez ces badges en contribuant à l'analyse d'influenceurs!")
    
    achievement_cols = st.columns(3)
    achievements_list = list(leaderboard_manager.ACHIEVEMENTS.values())
    
    for idx, achievement in enumerate(achievements_list):
        with achievement_cols[idx % 3]:
            st.markdown(f"""
            <div class="rank-card">
                <h3 style="margin: 0;">{achievement['name']}</h3>
                <p style="color: #6b7280; margin: 0.5rem 0;">{achievement['description']}</p>
                <p style="color: #667eea; font-weight: bold; margin: 0;">Seuil: {achievement['threshold']}</p>
            </div>
            """, unsafe_allow_html=True)

else:
    # Analysis page
    # Get contributor username from session state
    contributor_username = st.session_state.get('contributor_username', None)
    
    search_col1, search_col2 = st.columns([3, 1])
    
    with search_col1:
        influencer_name = st.text_input(
            "Nom de l'influenceur",
            placeholder="Ex: Squeezie, Norman, Cyprien...",
            help="Entrez le nom d'un influenceur français"
        )
    
    with search_col2:
        st.markdown("<br>", unsafe_allow_html=True)
        search_button = st.button("🔍 Analyser", type="primary", use_container_width=True)
    
    # Search logic
    if search_button and influencer_name:
        # Check cache first
        cached_data = None
        if use_cache:
            with st.spinner("Vérification du cache..."):
                cached_data = orchestrator.get_cached_results(influencer_name)
        
        if cached_data and use_cache:
            st.success(f"✅ Données en cache trouvées (dernière mise à jour: {cached_data['last_updated'].strftime('%d/%m/%Y %H:%M')})")
            results = cached_data
        else:
            # Run analysis
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            def update_progress(message, progress):
                status_text.text(message)
                progress_bar.progress(progress / 100)
            
            with st.spinner("Analyse en cours..."):
                try:
                    # Run async analysis with contributor tracking
                    results = asyncio.run(
                        orchestrator.analyze_influencer(
                            influencer_name, 
                            update_progress,
                            contributor_username=contributor_username
                        )
                    )
                    progress_bar.progress(100)
                    status_text.text("✅ Analyse terminée!")
                    
                    # Show points earned if contributor provided
                    if contributor_username and 'points_awarded' in results:
                        st.success(f"🎉 Vous avez gagné {results['points_awarded']} points!")
                        
                except Exception as e:
                    st.error(f"❌ Erreur lors de l'analyse: {str(e)}")
                    st.stop()
        
        # Display results
        st.markdown("---")
        st.markdown(f"## 📊 Résultats pour: **{influencer_name}**")
        
        # Metrics row
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <h2>{results['score_data']['trust_score']}/100</h2>
                <p>Score de Confiance</p>
                <p><strong>{results['trust_level']}</strong></p>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div class="drama-card">
                <h2>{results['score_data']['drama_count']}</h2>
                <p>Controverses</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="good-card">
                <h2>{results['score_data']['good_action_count']}</h2>
                <p>Actions Positives</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            total_mentions = len(results['mentions'])
            st.markdown(f"""
            <div class="metric-card">
                <h2>{total_mentions}</h2>
                <p>Mentions Totales</p>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Visualizations
        viz_col1, viz_col2 = st.columns(2)
        
        with viz_col1:
            st.markdown("### 📈 Distribution des Mentions")
            
            # Pie chart
            labels = ['Controverses', 'Actions Positives', 'Neutre']
            values = [
                results['score_data']['drama_count'],
                results['score_data']['good_action_count'],
                results['score_data']['neutral_count']
            ]
            colors = ['#ef4444', '#10b981', '#6b7280']
            
            fig_pie = go.Figure(data=[go.Pie(
                labels=labels,
                values=values,
                marker=dict(colors=colors),
                hole=0.4
            )])
            fig_pie.update_layout(
                showlegend=True,
                height=300,
                margin=dict(l=20, r=20, t=20, b=20)
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        
        with viz_col2:
            st.markdown("### 🎯 Score de Confiance")
            
            # Gauge chart
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=results['score_data']['trust_score'],
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Score"},
                gauge={
                    'axis': {'range': [None, 100]},
                    'bar': {'color': results['trust_color']},
                    'steps': [
                        {'range': [0, 20], 'color': "#fee2e2"},
                        {'range': [20, 40], 'color': "#fed7aa"},
                        {'range': [40, 60], 'color': "#fef3c7"},
                        {'range': [60, 80], 'color': "#dbeafe"},
                        {'range': [80, 100], 'color': "#d1fae5"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 50
                    }
                }
            ))
            fig_gauge.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_gauge, use_container_width=True)
        
        # Source distribution
        st.markdown("### 📊 Répartition par Source")
        source_counts = {}
        for mention in results['mentions']:
            source = mention['source']
            source_counts[source] = source_counts.get(source, 0) + 1
        
        if source_counts:
            df_sources = pd.DataFrame(list(source_counts.items()), columns=['Source', 'Count'])
            fig_bar = px.bar(
                df_sources,
                x='Source',
                y='Count',
                color='Count',
                color_continuous_scale='Blues'
            )
            fig_bar.update_layout(height=300, showlegend=False)
            st.plotly_chart(fig_bar, use_container_width=True)
        
        # Mentions list
        st.markdown("### 📝 Mentions Détaillées")
        
        # Filter tabs
        tab1, tab2, tab3, tab4 = st.tabs(["🔴 Toutes", "⚠️ Controverses", "✅ Actions Positives", "⚪ Neutres"])
        
        with tab1:
            display_mentions(results['mentions'], None)
        
        with tab2:
            drama_mentions = [m for m in results['mentions'] if m['label'] == 'drama']
            display_mentions(drama_mentions, 'drama')
        
        with tab3:
            good_mentions = [m for m in results['mentions'] if m['label'] == 'good_action']
            display_mentions(good_mentions, 'good_action')
        
        with tab4:
            neutral_mentions = [m for m in results['mentions'] if m['label'] == 'neutral']
            display_mentions(neutral_mentions, 'neutral')
        
        # Score breakdown
        with st.expander("🔍 Détails du Calcul du Score"):
            breakdown = results['score_data']['breakdown']
            st.markdown(f"""
            **Calcul du Score de Confiance:**
            - Score de base: `{breakdown['base']}`
            - Impact des controverses: `{breakdown['drama_impact']:.2f}`
            - Impact des actions positives: `{breakdown['good_action_impact']:.2f}`
            - Impact du sentiment: `{breakdown['sentiment_impact']:.2f}`
            - Facteur de récence: `{breakdown['recency_factor']:.2f}`
            
            **Score final: `{results['score_data']['trust_score']}/100`**
            """)
    
    elif not influencer_name and search_button:
        st.warning("⚠️ Veuillez entrer le nom d'un influenceur")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #6b7280; padding: 2rem;">
    <p>🔍 French Influencer Monitor | Hackathon Blackbox 2025</p>
    <p style="font-size: 0.9rem;">Analyse basée sur des données publiques | Résultats à titre informatif</p>
</div>
""", unsafe_allow_html=True)

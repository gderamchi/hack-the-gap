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

# Main content - Route based on page selection
if page == "🏆 Leaderboard":
    # Leaderboard page content will be added below
    pass
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
                # Run async analysis
                results = asyncio.run(
                    orchestrator.analyze_influencer(influencer_name, update_progress)
                )
                progress_bar.progress(100)
                status_text.text("✅ Analyse terminée!")
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

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #6b7280; padding: 2rem;">
    <p>🔍 French Influencer Monitor | Hackathon Blackbox 2025</p>
    <p style="font-size: 0.9rem;">Analyse basée sur des données publiques | Résultats à titre informatif</p>
</div>
""", unsafe_allow_html=True)

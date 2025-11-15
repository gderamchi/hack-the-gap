import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const DisclaimerModal: React.FC<Props> = ({ visible, onDismiss }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            ⚠️ Avertissement Important
          </Text>
          
          <Text variant="bodyMedium" style={styles.paragraph}>
            Cette application fournit des scores de confiance basés sur l'analyse de sources publiques disponibles en ligne.
          </Text>
          
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Limitations et Responsabilités
          </Text>
          
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Les scores sont <Text style={styles.bold}>indicatifs</Text> et ne constituent pas une vérité absolue
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Les informations proviennent de sources publiques et peuvent être incomplètes ou biaisées
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Nous ne fabriquons <Text style={styles.bold}>aucune information</Text> - toutes les données sont sourcées
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Les résultats peuvent contenir des erreurs ou des informations obsolètes
          </Text>
          
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Utilisation Responsable
          </Text>
          
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Vérifiez toujours les sources originales avant de tirer des conclusions
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Ne diffusez pas d'accusations non vérifiées
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Respectez la présomption d'innocence
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Utilisez ces informations à titre informatif uniquement
          </Text>
          
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Protection des Données
          </Text>
          
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Nous n'analysons que des données publiquement disponibles
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Aucune donnée personnelle n'est collectée sans consentement
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Les influenceurs peuvent demander la suppression de leurs données
          </Text>
          
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.button}
          >
            J'ai compris et j'accepte
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 24,
  },
});

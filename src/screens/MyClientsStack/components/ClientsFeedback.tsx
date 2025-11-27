import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { myClientsService } from '../../../services/api/myClientsService';
import { useSelector } from 'react-redux';
import ClientFeedbackCard from './ClientFeedbackCard';
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

const ClientsFeedback: React.FC = () => {
  const user = useSelector((state: any) => state.root.user.user);
  const [clientsFeedback, setClientsFeedback] = useState<any[]>([]);
  useEffect(() => {
    getClientsFeedback();
  }, []);

  const getClientsFeedback = async () => {
    try {
      const payload = {
        UserloginInfoId: user.Id,
      };
      const response = await myClientsService.getServiceProvidersFeedback(payload);
      if (response.ResponseStatus.STATUSCODE === 200) {
        setClientsFeedback(response.List);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clients Feedback ({clientsFeedback.length})</Text>
      <FlatList
        data={clientsFeedback}
        keyExtractor={(item) => String(item.OrderId)}
        contentContainerStyle={{ gap: 10, paddingTop: 10 }}
        renderItem={({ item }) => (
          <ClientFeedbackCard item={item} onDelete={() => {}} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
    lineHeight: Platform.OS === 'ios' ? 0 : 20,
    color: '#191919',
  },
  subtitle: {
    marginTop: 6,
    color: '#6b7280',
  },
});

export default ClientsFeedback;



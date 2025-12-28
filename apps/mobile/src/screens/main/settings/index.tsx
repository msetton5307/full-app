import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors, Fonts, Icons} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {CustomButtonSolid} from '../../../components/CustomButton';
import {navigate} from '../../../utils/helper/RootNaivgation';
import {RootStackParamList} from '../../../types';
import {useAppDispatch, useAppSelector} from '@app/redux';
import {logout} from '@app/utils/service/AuthService';
import {showMessage} from '@app/utils/helper/Toast';
import {updateSettings} from '@app/redux/slice/user.slice';
import {
  sendLatestDealNotification,
  getMergedJsonDeals,
  updateUserSettings,
} from '@app/utils/service/UserService';
import {debounce} from 'lodash';

type InfoSettingsKeys = 'notification' | 'preferences' | 'email_notification';

const Setting = () => {
  const dispatch = useAppDispatch();
  const _settings = useAppSelector(state => state.user.settings);
  const {isAdmin} = useAppSelector(state => state.auth);

  const [infoSettings, setInfoSettings] = useState<
    Record<InfoSettingsKeys, boolean>
  >({
    notification: _settings.notification,
    preferences: _settings.preferences,
    email_notification: _settings.email_notification,
  });
  const [adminDeals, setAdminDeals] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const adminUsers = useMemo(
    () => [
      {id: '1', name: 'Alex Johnson', email: 'alex.johnson@example.com'},
      {id: '2', name: 'Priya Patel', email: 'priya.patel@example.com'},
      {id: '3', name: 'Diego Martínez', email: 'diego.martinez@example.com'},
      {id: '4', name: 'Chen Wei', email: 'chen.wei@example.com'},
    ],
    [],
  );

  const updateInfo = (key: InfoSettingsKeys, value: boolean) => {
    setInfoSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const navigatorList: {label: string; navigateTo: keyof RootStackParamList}[] =
    [
      {label: 'Terms & Conditions', navigateTo: 'TermsCondition'},
      {label: 'Privacy Policy', navigateTo: 'PrivacyPolicy'},
    ];

  const loadAdminDeals = async () => {
    setAdminLoading(true);
    try {
      const result = await dispatch(
        getMergedJsonDeals({
          page: 1,
          pageSize: 50,
        }),
      );

      if (result?.success && Array.isArray(result?.data)) {
        setAdminDeals(result.data);
      } else {
        setAdminDeals([]);
      }
    } catch (error) {
      console.error('Error loading admin deals:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  async function handleLogout() {
    const result = await dispatch(logout());
    showMessage(result?.message);
  }

  const debouncedSubmit = debounce(async settings => {
    try {
      const result = await dispatch(
        updateUserSettings({
          email_notifications: settings.email_notification,
          notifications: settings.notification,
          preferences: settings.preferences,
        }),
      );
      // showMessage(result?.message);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  }, 500);

  useEffect(() => {
    debouncedSubmit(infoSettings);
  }, [infoSettings]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminDeals();
    }
  }, [isAdmin]);

  const latestDeal = useMemo(() => adminDeals[0], [adminDeals]);

  const handleSendTestNotification = async () => {
    if (!latestDeal) {
      showMessage('No deals available to send notifications.');
      return;
    }

    setSendingNotification(true);
    try {
      const result = await dispatch(
        sendLatestDealNotification({
          dealId: latestDeal?.id || latestDeal?.deal_id,
        }),
      );

      if (result?.success) {
        showMessage(result?.message || 'Notification sent to all users.');
      } else {
        showMessage(
          result?.message || 'Failed to send the test notification.',
        );
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showMessage('Unable to send the test notification.');
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <GeneralTemplate isSearch={false}>
      <Text style={styles.textStyle}>Settings</Text>
      <View style={styles.container}>
        {['notification', 'preferences', 'email_notification'].map(
          (key, index) => (
            <ToggleOption
              key={index}
              label={
                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
              }
              status={infoSettings[key as InfoSettingsKeys]} // Type-safe access
              onToggle={value => {
                updateInfo(key as InfoSettingsKeys, value); // Cast key to correct type
                dispatch(
                  updateSettings({
                    key: key as keyof typeof infoSettings,
                    value,
                  }),
                );
              }}
            />
          ),
        )}

        <View style={styles.line} />
        {navigatorList.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={[styles.onOffMainContainer, Css.jcfs, Css.g3]}
              activeOpacity={0.9}
              onPress={() => navigate(item.navigateTo)}>
              <Image source={Icons.arrow_right} style={Css.icon16} />
              <Text style={[styles.labelText, {color: Colors.Aztec_Gold}]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {isAdmin && (
        <View style={styles.adminContainer}>
          <Text style={styles.adminTitle}>Admin Panel</Text>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Deals</Text>
              <Text style={styles.statValue}>{adminDeals.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statValue}>{adminUsers.length}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Deals</Text>
          <CustomButtonSolid
            label={sendingNotification ? 'Sending...' : 'Send Test Notification'}
            disabled={sendingNotification || !latestDeal}
            onPress={handleSendTestNotification}
            btnStyle={[styles.actionButton, Css.mh0]}
            textStyle={styles.actionButtonText}
          />
          <View style={styles.listContainer}>
            {adminLoading ? (
              <Text style={styles.helperText}>Loading deals...</Text>
            ) : adminDeals.length === 0 ? (
              <Text style={styles.helperText}>No deals available.</Text>
            ) : (
              adminDeals.map((item, index) => (
                <View
                  style={styles.listItem}
                  key={`${item?.id || item?.deal_id || 'deal'}-${index}`}>
                  <View style={styles.listContent}>
                    <Text style={styles.listTitle}>
                      {item?.title || item?.name || 'Untitled Deal'}
                    </Text>
                    {item?.description ? (
                      <Text style={styles.listSubtitle} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => showMessage('Edit flow coming soon')}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionHeading}>Users</Text>
          <View style={styles.listContainer}>
            {adminUsers.map(user => (
              <View style={styles.listItem} key={user.id}>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{user.name}</Text>
                  <Text style={styles.listSubtitle}>{user.email}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      <CustomButtonSolid
        label="Logout"
        onPress={() => {
          Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Logout',
                onPress: () => handleLogout(),
                style: 'destructive',
              },
            ],
            {cancelable: true},
          );
        }}
      />
    </GeneralTemplate>
  );
};

const ToggleOption = ({
  label,
  status,
  onToggle,
}: {
  label: string;
  status: boolean;
  onToggle: (value: boolean) => void;
}) => (
  <View style={styles.onOffMainContainer}>
    <Text style={styles.labelText}>{`${label}:`}</Text>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(!status)}
      style={[styles.onOffContainer, status ? Css.fdr : Css.fdrr]}>
      <View
        style={[
          styles.onOffDot,
          {backgroundColor: status ? Colors.Aztec_Gold : Colors.Old_Silver},
        ]}
      />
      <Text
        style={[
          styles.onOffText,
          {color: status ? Colors.Aztec_Gold : Colors.Old_Silver},
        ]}>
        {status ? 'ON' : 'OFF'}
      </Text>
    </TouchableOpacity>
  </View>
);

export default Setting;

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  container: {
    marginTop: moderateScale(15),
    width: '100%',
    backgroundColor: Colors.white,
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 1,
      width: 1,
    },
    elevation: 5,
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(20),
    gap: moderateScale(15),
  },
  labelText: {
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    textTransform: 'capitalize'
  },
  onOffContainer: {
    width: moderateScale(60),
    height: moderateScale(25),
    borderRadius: moderateScale(30),
    backgroundColor: Colors.grayish,
    alignItems: 'center',
    flexDirection: 'row',
  },
  onOffDot: {
    height: moderateScale(15),
    width: moderateScale(15),
    borderRadius: moderateScale(15),
    margin: moderateScale(5),
  },
  onOffMainContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onOffText: {
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(12),
  },
  line: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.gainsboro,
  },
  adminContainer: {
    marginTop: moderateScale(20),
    backgroundColor: Colors.white,
    padding: moderateScale(16),
    borderRadius: moderateScale(10),
    gap: moderateScale(12),
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 1,
      width: 1,
    },
    elevation: 5,
  },
  adminTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(16),
    color: Colors.black,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.Floral_White,
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.gainsboro,
  },
  statLabel: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(12),
    color: Colors.Old_Silver,
  },
  statValue: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(20),
    color: Colors.Aztec_Gold,
  },
  sectionHeading: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
    color: Colors.black,
    marginTop: moderateScale(6),
  },
  listContainer: {
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.gainsboro,
    backgroundColor: Colors.white,
  },
  actionButton: {
    marginTop: moderateScale(10),
  },
  actionButtonText: {
    fontFamily: Fonts.PoppinsSemiBold,
  },
  listItem: {
    padding: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.gainsboro,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(10),
  },
  listContent: {
    flex: 1,
    gap: moderateScale(4),
  },
  listTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
    fontSize: moderateScale(13),
  },
  listSubtitle: {
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.Old_Silver,
    fontSize: moderateScale(12),
  },
  helperText: {
    padding: moderateScale(12),
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.Old_Silver,
  },
  editButton: {
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(14),
    backgroundColor: Colors.Aztec_Gold,
    borderRadius: moderateScale(8),
  },
  editButtonText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(12),
  },
});

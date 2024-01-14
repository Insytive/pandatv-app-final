import React from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const EulaConsent = ({ onClose }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Panda TV Chat Feature End User License Agreement (EULA)
      </Text>

      <Text style={styles.heading}>Acceptance of Terms</Text>
      <Text style={styles.text}>
        By using the chat feature on Panda TV, you agree to be bound by the
        terms of this EULA. If you do not agree to the terms, do not use the
        chat feature.
      </Text>

      <Text style={styles.heading}>License Grant</Text>
      <Text style={styles.text}>
        Panda TV grants you a non-exclusive, non-transferable, revocable license
        to use the chat feature for personal, non-commercial purposes, subject
        to the terms of this EULA.
      </Text>

      <Text style={styles.heading}>Use Restrictions</Text>
      <Text style={styles.text}>
        Violates any laws or regulations. Infringes on the rights of others. Is
        harmful, fraudulent, deceptive, threatening, harassing, defamatory,
        obscene, or otherwise objectionable.
      </Text>

      <Text style={styles.heading}>User Content</Text>
      <Text style={styles.text}>
        You retain all rights in, and are solely responsible for, the content
        you transmit through the chat feature. You grant Panda TV a worldwide,
        royalty-free license to use, reproduce, distribute, modify, and display
        the content as needed for the operation of the chat feature.
      </Text>

      <Text style={styles.heading}>Privacy and Data Protection</Text>
      <Text style={styles.text}>
        Panda TV will collect and use your data in accordance with its Privacy
        Policy.
      </Text>

      <Text style={styles.heading}>Limitation of Liability</Text>
      <Text style={styles.text}>
        Panda TV will not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising out of or in connection with
        your use of the chat feature.
      </Text>

      <Text style={styles.heading}>Termination</Text>
      <Text style={styles.text}>
        This EULA is effective until terminated. Panda TV may terminate or
        suspend your access to the chat feature at any time, without notice, for
        conduct that Panda TV believes violates this EULA or is harmful to other
        users, Panda TV, or third parties.
      </Text>

      <Text style={styles.heading}>Disclaimer of Warranties</Text>
      <Text style={styles.text}>
        The chat feature is provided “as is” and “as available” without any
        warranties of any kind, either express or implied.
      </Text>

      <Text style={styles.heading}>Limitation of Liability</Text>
      <Text style={styles.text}>
        The chat feature is provided “as is” and “as available” without any
        warranties of any kind, either express or implied.
      </Text>

      <Text style={styles.heading}>Governing Law</Text>
      <Text style={styles.text}>
        This EULA and your use of the chat feature are governed by the laws of
        South Africa.
      </Text>

      <Text style={styles.heading}>Amendments to this EULA</Text>
      <Text style={styles.text}>
        Panda TV reserves the right to amend this EULA at any time by posting a
        revised version on its website or within the app.
      </Text>

      <Text style={styles.heading}>Contact Information</Text>
      <Text style={styles.text}>
        For any questions about this EULA, please contact Panda TV at
        info@skillspanda.co.za
      </Text>

      {/* Assuming you have an 'Agree' button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity onPress={onClose} style={styles.button}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    // paddingBottom: 125,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    marginBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  buttonWrapper: {
    marginBottom: 50,
  },
});

export default EulaConsent;
